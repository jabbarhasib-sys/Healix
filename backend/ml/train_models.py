"""
ml/train_models.py
Trains Random Forest (condition) + XGBoost (cost) models on synthetic data.
Run once before starting the server:
    python backend/ml/train_models.py

Saves to ml/saved_models/
"""
import json
import sys
import csv
import numpy as np
import joblib
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.config import settings
from core.logger import logger, setup_logger
from ml.feature_engineering import extract_features, extract_cost_features, SYMPTOM_VOCAB


def _load_symptom_training_data(path: Path) -> tuple[np.ndarray, list[str]]:
    if not path.exists():
        raise FileNotFoundError(f"{path} not found. Run generate_symptoms.py first.")

    X_rows, y = [], []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            parsed = {
                "symptoms": [sym for sym in SYMPTOM_VOCAB if row.get(sym) == "1"],
                "severity": "moderate",
                "gender": "unknown",
                "age_approx": None,
                "budget_inr": None,
                "symptom_duration": None,
                "ambiguity_score": 0.3,
            }
            X_rows.append(extract_features(parsed))
            y.append(row["_condition"])

    return np.array(X_rows, dtype=np.float32), y


def _load_cost_training_data(path: Path) -> tuple[np.ndarray, np.ndarray]:
    if not path.exists():
        raise FileNotFoundError(f"{path} not found. Run generate_costs.py first.")

    X_rows, y = [], []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            parsed = {
                "symptoms": [],
                "severity": "moderate",
                "gender": "unknown",
                "age_approx": 40,
                "budget_inr": None,
                "symptom_duration": None,
                "ambiguity_score": 0.3,
            }
            hospital = {
                "tier_factor": float(row["tier_factor"]),
                "location_factor": float(row["city_factor"]),
                "base_cost_per_day": float(row["base_cost"]),
                "er_capable": False,
            }
            urgency_map = {"government": "routine", "mid": "routine", "premium": "urgent", "super_specialty": "urgent"}
            urgency = urgency_map.get(row.get("tier", "mid"), "routine")

            vec = extract_cost_features(parsed, hospital, urgency)
            X_rows.append(vec)
            y.append(float(row["estimated_cost"]))

    return np.array(X_rows, dtype=np.float32), np.array(y, dtype=np.float32)


def train_condition_classifier(data_path: Path, out_path: Path):
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import cross_val_score
    from sklearn.preprocessing import LabelEncoder

    logger.info("Training condition Random Forest classifier...")
    X, y_raw = _load_symptom_training_data(data_path)

    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    clf.fit(X, y)

    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    logger.info(f"RF CV accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": clf, "classes": le.classes_.tolist()}, out_path)
    logger.info(f"Saved condition RF → {out_path}")
    return cv_scores.mean()


def train_cost_regressor(data_path: Path, out_path: Path):
    from xgboost import XGBRegressor
    from sklearn.model_selection import cross_val_score

    logger.info("Training XGBoost cost regressor...")
    X, y = _load_cost_training_data(data_path)

    reg = XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.80,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    reg.fit(X, y)

    cv_r2 = cross_val_score(reg, X, y, cv=5, scoring="r2")
    logger.info(f"XGB cost R²: {cv_r2.mean():.3f} ± {cv_r2.std():.3f}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(reg, out_path)
    logger.info(f"Saved cost XGB → {out_path}")
    return cv_r2.mean()


def main():
    setup_logger()
    data_dir = Path("data/synthetic")
    model_dir = Path(settings.ml_models_path)

    results = {}

    try:
        acc = train_condition_classifier(
            data_dir / "symptom_training_data.csv",
            model_dir / "condition_rf.joblib",
        )
        results["condition_rf_accuracy"] = round(acc, 3)
    except FileNotFoundError as e:
        logger.error(str(e))

    try:
        r2 = train_cost_regressor(
            data_dir / "cost_training_data.csv",
            model_dir / "cost_xgb.joblib",
        )
        results["cost_xgb_r2"] = round(r2, 3)
    except FileNotFoundError as e:
        logger.error(str(e))

    logger.info(f"Training complete: {results}")
    print("\n✓ Models trained:", results)


if __name__ == "__main__":
    main()
