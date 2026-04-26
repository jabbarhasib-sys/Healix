"""
services/embeddings.py
Sentence-transformer embeddings + ChromaDB semantic symptom search.
Lazy-loaded — model only loads on first use (saves memory at startup).
"""
from __future__ import annotations
import os
from typing import Optional
from core.config import settings
from core.logger import logger

_encoder = None
_collection = None


def _get_encoder():
    global _encoder
    if _encoder is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embeddings model: {settings.embeddings_model}")
            _encoder = SentenceTransformer(settings.embeddings_model)
            logger.info("Embeddings model loaded ✓")
        except Exception as e:
            logger.warning(f"SentenceTransformer unavailable: {e}")
            _encoder = None
    return _encoder


def _get_collection():
    global _collection
    if _collection is None:
        try:
            import chromadb
            os.makedirs(settings.chroma_persist_path, exist_ok=True)
            client = chromadb.PersistentClient(path=settings.chroma_persist_path)
            _collection = client.get_or_create_collection(
                name=settings.chroma_collection,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info(
                f"ChromaDB collection '{settings.chroma_collection}' "
                f"loaded ({_collection.count()} docs)"
            )
        except Exception as e:
            logger.warning(f"ChromaDB unavailable: {e}")
            _collection = None
    return _collection


def encode(texts: list[str]) -> list[list[float]] | None:
    enc = _get_encoder()
    if enc is None:
        return None
    try:
        return enc.encode(texts, show_progress_bar=False).tolist()
    except Exception as e:
        logger.warning(f"Encode failed: {e}")
        return None


def add_symptoms(symptom_texts: list[str], condition_labels: list[str], ids: list[str]):
    """Index symptom descriptions into ChromaDB."""
    col = _get_collection()
    enc = _get_encoder()
    if col is None or enc is None:
        logger.warning("Skipping ChromaDB index — encoder or collection unavailable")
        return

    embeddings = enc.encode(symptom_texts, show_progress_bar=True).tolist()
    col.add(
        embeddings=embeddings,
        documents=symptom_texts,
        metadatas=[{"condition": c} for c in condition_labels],
        ids=ids,
    )
    logger.info(f"Indexed {len(symptom_texts)} symptom entries into ChromaDB")


async def search_similar(query: str, n_results: int = 5) -> list[dict]:
    """
    Semantic symptom search — returns top-n similar conditions.
    Falls back to [] if ChromaDB/encoder not available (non-fatal).
    """
    col = _get_collection()
    enc = _get_encoder()
    if col is None or enc is None or col.count() == 0:
        return []

    try:
        query_vec = enc.encode([query]).tolist()
        results = col.query(
            query_embeddings=query_vec,
            n_results=min(n_results, col.count()),
            include=["documents", "metadatas", "distances"],
        )
        output = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            output.append({
                "condition": meta.get("condition"),
                "symptom_text": doc,
                "similarity": round(1 - dist, 4),
            })
        return output
    except Exception as e:
        logger.warning(f"ChromaDB search failed (non-fatal): {e}")
        return []
