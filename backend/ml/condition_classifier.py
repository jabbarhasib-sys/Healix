"""
ml/condition_classifier.py
Random Forest symptom→condition classifier.
Used as cross-check alongside LLM output — never as sole source.
"""
import numpy as np
import joblib
from pathlib import Path
from typing import Optional
from core.config import settings
from core.logger import logger
from core.exceptions import ModelNotLoadedError
from ml.feature_engineering import extract_features

_model = None
_classes = None
_MODEL_PATH = Path(settings.ml_models_path) / "condition_rf.joblib"


def load() -> bool:
    global _model, _classes
    if not _MODEL_PATH.exists():
        logger.warning(f"Condition RF model not found at {_MODEL_PATH}. Run train_models.py")
        return False
    try:
        bundle = joblib.load(_MODEL_PATH)
        _model = bundle["model"]
        _classes = bundle["classes"]
        logger.info(f"Condition RF loaded ({len(_classes)} classes)")
        return True
    except Exception as e:
        logger.error(f"Failed to load condition RF: {e}")
        return False


def predict(parsed_input: dict, top_n: int = 3) -> list[dict]:
    """
    Returns top-n predicted conditions with probabilities.
    Falls back to [] if model not loaded (non-fatal, LLM handles it).
    """
    global _model, _classes

    if _model is None:
        if not load():
            return []

    try:
        vec = extract_features(parsed_input).reshape(1, -1)
        proba = _model.predict_proba(vec)[0]

        top_indices = np.argsort(proba)[::-1][:top_n]
        results = []
        total = sum(proba[i] for i in top_indices)

        for idx in top_indices:
            if proba[idx] < 0.05:
                continue
            results.append({
                "condition": _classes[idx],
                "probability": round(float(proba[idx]) / max(total, 0.001), 4),
                "source": "ml_rf",
            })

        logger.debug(f"RF classifier: {[(r['condition'][:20], r['probability']) for r in results]}")
        return results

    except Exception as e:
        logger.warning(f"RF prediction failed (non-fatal): {e}")
        return []
