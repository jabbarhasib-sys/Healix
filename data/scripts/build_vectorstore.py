"""
data/scripts/build_vectorstore.py
Embeds symptom descriptions into ChromaDB for semantic search.
Run AFTER generate_symptoms.py.
Usage: python data/scripts/build_vectorstore.py
"""
import json
import sys
import uuid
from pathlib import Path
 
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))
 
from core.logger import logger, setup_logger
from core.config import settings
 
 
def build_documents(symptom_map: dict) -> tuple[list[str], list[str], list[str]]:
    """
    Converts symptom→condition map into embeddable documents.
    Each doc = symptom cluster text for one condition.
    """
    docs, labels, ids = [], [], []
    for condition, data in symptom_map.items():
        syms = list(data["symptoms"].keys())
 
        # Primary document: full symptom cluster
        docs.append(
            f"Patient presents with: {', '.join(syms[:8])}. "
            f"Category: {data['category']}. Urgency: {data['urgency']}."
        )
        labels.append(condition)
        ids.append(f"cond_{uuid.uuid4().hex[:8]}")
 
        # Secondary docs: individual high-weight symptoms (improves recall)
        for sym, weight in data["symptoms"].items():
            if weight >= 0.70:
                docs.append(f"Symptom: {sym}. Condition: {condition}.")
                labels.append(condition)
                ids.append(f"sym_{uuid.uuid4().hex[:8]}")
 
    return docs, labels, ids
 
 
def main():
    setup_logger()
 
    data_path = Path("data/synthetic/symptom_conditions.json")
    if not data_path.exists():
        logger.error(f"Not found: {data_path}. Run generate_symptoms.py first.")
        sys.exit(1)
 
    with open(data_path) as f:
        symptom_map = json.load(f)
 
    logger.info(f"Building vector store from {len(symptom_map)} conditions...")
 
    docs, labels, ids = build_documents(symptom_map)
    logger.info(f"Prepared {len(docs)} documents to embed")
 
    # Import here so script doesn't crash if sentence-transformers not installed
    try:
        from services.embeddings import add_symptoms
        add_symptoms(docs, labels, ids)
        logger.info(f"ChromaDB vector store built at: {settings.chroma_persist_path}")
        logger.info(f"Total vectors: {len(docs)}")
    except ImportError as e:
        logger.error(f"Missing dependency: {e}. Run: pip install sentence-transformers chromadb")
        sys.exit(1)
 
 
if __name__ == "__main__":
    main()
 