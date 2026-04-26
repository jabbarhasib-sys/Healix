"""
ml/cost_regressor.py
XGBoost cost regression model.
Predicts total treatment cost given patient features + hospital profile.
"""
import numpy as np
import joblib
from pathlib import Path
from core.config import settings
from core.logger import logger
from ml.feature_engineering import extract_cost_features

_model = None
_MODEL_PATH = Path(settings.ml_models_path) / "cost_xgb.joblib"


def load() -> bool:
    global _model
    if not _MODEL_PATH.exists():
        logger.warning(f"Cost XGB model not found at {_MODEL_PATH}. Run train_models.py")
        return False
    try:
        _model = joblib.load(_MODEL_PATH)
        logger.info("Cost XGBoost regressor loaded")
        return True
    except Exception as e:
        logger.error(f"Failed to load cost XGB: {e}")
        return False


def predict_cost(
    parsed_input: dict,
    hospital: dict,
    urgency: str,
) -> Optional[dict]:
    """
    Returns ML-predicted cost with confidence interval.
    Returns None if model unavailable — cost_model.py heuristic takes over.
    """
    global _model

    if _model is None:
        if not load():
            return None

    try:
        vec = extract_cost_features(parsed_input, hospital, urgency).reshape(1, -1)
        pred = float(_model.predict(vec)[0])

        # Uncertainty via quantile estimators if available, else ±20%
        variance = 0.20
        return {
            "estimate": int(round(pred, -2)),
            "min": int(round(pred * (1 - variance), -2)),
            "max": int(round(pred * (1 + variance), -2)),
            "source": "ml_xgb",
        }
    except Exception as e:
        logger.warning(f"XGB cost prediction failed (non-fatal): {e}")
        return None


def get_feature_importance(top_n: int = 10) -> list[dict]:
    """SHAP-style feature importances for explainability UI."""
    global _model
    if _model is None:
        if not load():
            return []
    try:
        from ml.feature_engineering import feature_names
        names = feature_names() + [
            "tier_factor_norm", "location_factor_norm",
            "base_cost_norm", "urgency_enc", "er_capable",
        ]
        importances = _model.feature_importances_
        paired = sorted(
            zip(names[:len(importances)], importances),
            key=lambda x: x[1], reverse=True,
        )
        return [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in paired[:top_n]
        ]
    except Exception as e:
        logger.warning(f"Feature importance failed: {e}")
        return []
