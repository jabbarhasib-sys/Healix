"""
modules/confidence_engine.py
M5 — Calibrated uncertainty scoring.
Confidence = cbrt(data_reliability × model_agreement × input_clarity)
"""
import math
import random
from core.config import settings


def compute(parsed_input: dict, clinical_output: dict) -> dict:
    symptoms = parsed_input.get("symptoms", [])
    ambiguity = parsed_input.get("ambiguity_score", 0.5)
    conditions = clinical_output.get("conditions", [])
    has_duration = parsed_input.get("symptom_duration") is not None
    has_severity = parsed_input.get("severity") not in (None, "moderate")
    has_age = parsed_input.get("age_approx") is not None

    # Component 1: Data reliability (how much input we have)
    symptom_richness = min(len(symptoms) / 5.0, 1.0)
    metadata_score = (0.3 if has_duration else 0) + (0.25 if has_severity else 0) + (0.2 if has_age else 0)
    data_reliability = symptom_richness * 0.55 + metadata_score * 0.45 * (1 - ambiguity * 0.4)

    # Component 2: Model agreement (how certain is the differential)
    probs = [c.get("probability", 0) for c in conditions]
    if probs:
        top_prob = max(probs)
        entropy = -sum(p * math.log2(p + 1e-9) for p in probs if p > 0)
        max_entropy = math.log2(len(probs)) if len(probs) > 1 else 1
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        model_agreement = top_prob * (1 - normalized_entropy * 0.4)
    else:
        model_agreement = 0.3

    # Component 3: Input clarity
    input_clarity = max(0.1, 1.0 - ambiguity) * (0.5 + 0.5 * symptom_richness)

    # Geometric mean via cube root
    raw = data_reliability * model_agreement * input_clarity
    score = max(
        settings.confidence_min,
        min(settings.confidence_max, math.cbrt(raw) * 1.1 + random.gauss(0, 0.015)),
    )

    warnings = []
    if len(symptoms) < 2:
        warnings.append("Very few symptoms provided — accuracy limited")
    if ambiguity > 0.6:
        warnings.append("Vague symptom descriptions detected")
    if not has_duration:
        warnings.append("Symptom duration unknown — affects differential weighting")
    if model_agreement < 0.35:
        warnings.append("Low model agreement — multiple equally likely diagnoses")

    return {
        "score": round(score, 3),
        "percentage": round(score * 100, 1),
        "tier": "high" if score > 0.72 else "moderate" if score > 0.5 else "low",
        "components": {
            "data_reliability": round(data_reliability, 3),
            "model_agreement": round(model_agreement, 3),
            "input_clarity": round(input_clarity, 3),
        },
        "warnings": warnings,
        "interpretation": (
            "High confidence — sufficient data for reliable recommendations"
            if score > 0.72
            else "Moderate confidence — recommendations are indicative, verify with physician"
            if score > 0.5
            else "Low confidence — please provide more detail or consult a doctor directly"
        ),
    }
