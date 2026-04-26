"""
ml/feature_engineering.py
Converts parsed patient input into numeric feature vectors for ML models.
Used by both condition_classifier and cost_regressor.
"""
import numpy as np
from typing import Optional

# Master symptom vocabulary — must stay in sync with generate_symptoms.py
SYMPTOM_VOCAB = sorted([
    "abdominal pain", "acid regurgitation", "altered consciousness", "anxiety",
    "arm weakness", "aura", "back pain", "bloating", "blurred vision",
    "bone pain", "breathlessness", "burning urination", "chest discomfort",
    "chest pain", "chest tightness", "chills", "cloudy urine", "confusion",
    "constipation", "cough", "cramping", "crushing chest pain", "cyclical fever",
    "dark urine", "diarrhoea", "dizziness", "dysphagia", "ear pain",
    "excessive thirst", "exercise intolerance", "exertional chest pain",
    "extreme fatigue", "eye pain", "facial drooping", "fatigue", "fever",
    "frequent urination", "hand pain", "haemoptysis", "headache", "heartburn",
    "heat intolerance", "insomnia", "jaw pain", "joint pain", "joint swelling",
    "left arm pain", "leg swelling", "light sensitivity", "loss of appetite",
    "loss of balance", "loss of consciousness", "low blood pressure",
    "malaise", "morning stiffness", "muscle pain", "muscle weakness",
    "nausea", "neck stiffness", "night sweats", "nocturnal cough", "nosebleed",
    "numbness", "pain worsening on sitting", "palpitations", "pelvic pain",
    "petechiae", "photophobia", "radiating arm pain", "radiating leg pain",
    "rapid breathing", "rash", "rebound tenderness", "recurrent infections",
    "right lower abdominal pain", "sciatica", "severe body ache",
    "severe headache", "skin mottling", "slurred speech", "slow healing wounds",
    "sore throat", "sound sensitivity", "sudden breathlessness",
    "sudden confusion", "sudden severe headache", "sudden vision loss",
    "sweating", "symmetrical joint involvement", "syncope", "tingling",
    "tingling extremities", "tremor", "throbbing headache", "urticaria",
    "vision changes", "vomiting", "weight gain", "weight loss", "wheezing",
])

SEVERITY_MAP = {"mild": 0, "moderate": 1, "severe": 2, "critical": 3}
GENDER_MAP = {"male": 0, "female": 1, "unknown": 0}

N_FEATURES = len(SYMPTOM_VOCAB) + 6  # symptoms + severity + gender + age + budget + duration + ambiguity


def extract_features(parsed_input: dict) -> np.ndarray:
    """
    Converts M1 parsed output → fixed-length numeric feature vector.
    Shape: (N_FEATURES,)
    """
    vec = np.zeros(N_FEATURES, dtype=np.float32)

    # Symptom binary flags
    syms_lower = {s.lower() for s in parsed_input.get("symptoms", [])}
    for i, sym in enumerate(SYMPTOM_VOCAB):
        if sym in syms_lower:
            vec[i] = 1.0

    base = len(SYMPTOM_VOCAB)

    # Severity (0-3 normalised to 0-1)
    sev = parsed_input.get("severity", "moderate")
    vec[base] = SEVERITY_MAP.get(sev, 1) / 3.0

    # Gender
    vec[base + 1] = GENDER_MAP.get(parsed_input.get("gender", "unknown"), 0)

    # Age (normalised 0-1 over 0-100 range)
    age = parsed_input.get("age_approx")
    vec[base + 2] = min((age or 40) / 100.0, 1.0)

    # Budget (log-normalised, cap at 10L)
    budget = parsed_input.get("budget_inr")
    if budget and budget > 0:
        import math
        vec[base + 3] = min(math.log10(budget) / 6.0, 1.0)  # log10(1M) = 6

    # Duration in days (normalised over 90-day window)
    duration_str = parsed_input.get("symptom_duration", "")
    vec[base + 4] = _parse_duration_days(duration_str) / 90.0

    # Ambiguity score (direct)
    vec[base + 5] = float(parsed_input.get("ambiguity_score", 0.5))

    return vec


def extract_cost_features(
    parsed_input: dict,
    hospital: dict,
    urgency: str,
) -> np.ndarray:
    """
    Feature vector for cost regression.
    Shape: (N_FEATURES + 5,)
    """
    base_vec = extract_features(parsed_input)

    extra = np.array([
        hospital.get("tier_factor", 1.0) / 2.6,           # normalised tier factor
        hospital.get("location_factor", 1.0) / 1.35,       # normalised location factor
        hospital.get("base_cost_per_day", 5000) / 45000,   # normalised base cost
        {"routine": 0.0, "urgent": 0.5, "emergency": 1.0}.get(urgency, 0.0),
        1.0 if hospital.get("er_capable") else 0.0,
    ], dtype=np.float32)

    return np.concatenate([base_vec, extra])


def _parse_duration_days(duration_str: str) -> float:
    if not duration_str:
        return 3.0  # assumed default
    import re
    m = re.search(r"(\d+)\s*(hour|day|week|month|year)", duration_str.lower())
    if not m:
        return 3.0
    val, unit = int(m.group(1)), m.group(2)
    return {"hour": val / 24, "day": float(val), "week": val * 7,
            "month": val * 30, "year": val * 365}.get(unit, 3.0)


def feature_names() -> list[str]:
    return SYMPTOM_VOCAB + [
        "severity_norm", "gender", "age_norm",
        "budget_log_norm", "duration_norm", "ambiguity",
    ]
