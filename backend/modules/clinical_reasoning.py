"""
modules/clinical_reasoning.py
M2 — Probabilistic differential diagnosis via LLM + rule-based cross-check.
"""
import json
import math
from core.logger import logger
# inference module removed — rule-based scoring used directly


# Rule-based symptom cluster weights (used to validate/cross-check LLM output)
_CLUSTER_WEIGHTS: dict[str, dict[str, float]] = {
    "STEMI": {
        "chest pain": 0.40, "radiating": 0.20, "breathlessness": 0.15,
        "sweating": 0.10, "palpitations": 0.08, "nausea": 0.07,
    },
    "URTI": {
        "sore throat": 0.30, "runny nose": 0.25, "fever": 0.20,
        "cough": 0.15, "fatigue": 0.10,
    },
    "Pneumonia": {
        "fever": 0.25, "productive cough": 0.30, "breathlessness": 0.20,
        "chest pain": 0.15, "fatigue": 0.10,
    },
    "Migraine": {
        "headache": 0.40, "nausea": 0.20, "vision changes": 0.20,
        "dizziness": 0.10, "fatigue": 0.10,
    },
    "Appendicitis": {
        "abdominal pain": 0.40, "nausea": 0.20, "fever": 0.20,
        "vomiting": 0.15, "constipation": 0.05,
    },
    "T2DM": {
        "excessive thirst": 0.30, "frequent urination": 0.30,
        "fatigue": 0.20, "weight loss": 0.10, "blurred vision": 0.10,
    },
}


def _rule_based_scores(symptoms: list[str]) -> dict[str, float]:
    syms_lower = {s.lower() for s in symptoms}
    scores = {}
    for condition, weights in _CLUSTER_WEIGHTS.items():
        score = sum(w for s, w in weights.items() if s in syms_lower)
        if score > 0.2:
            scores[condition] = score
    total = sum(scores.values()) or 1
    return {k: round(v / total, 4) for k, v in sorted(scores.items(), key=lambda x: -x[1])}


def _normalize_probabilities(conditions: list[dict]) -> list[dict]:
    total = sum(c.get("probability", 0) for c in conditions)
    if total == 0:
        return conditions
    for c in conditions:
        c["probability"] = round(c.get("probability", 0) / total, 4)
    return conditions


def _rule_based_fallback(symptoms: list[str], risk_flags: list[str], rule_scores: dict) -> dict:
    fallback_conditions = [
        {
            "name": name,
            "icd10_code": "R69",
            "probability": prob,
            "category": "other",
            "urgency": "routine",
            "recommended_specialty": "General Medicine",
            "supporting_symptoms": symptoms,
            "against_symptoms": [],
            "reasoning": f"Rule-based scoring on {len(symptoms)} symptoms.",
        }
        for name, prob in list(rule_scores.items())[:3]
    ] or [{
        "name": "Undifferentiated Illness",
        "icd10_code": "R69",
        "probability": 1.0,
        "category": "other",
        "urgency": "routine",
        "recommended_specialty": "General Medicine",
        "supporting_symptoms": symptoms,
        "against_symptoms": [],
        "reasoning": "Insufficient data for specific diagnosis. Please provide more symptom detail.",
    }]

    return {
        "conditions": fallback_conditions,
        "overall_urgency": "routine",
        "red_flags_identified": risk_flags,
        "recommended_tests": ["Full blood count", "Metabolic panel", "Urine analysis"],
        "reasoning_chain": ["Rule-based scoring used — no LLM available"],
        "clinical_summary": "Analysis based on symptom pattern matching. Consult a physician.",
    }


async def run(parsed_input: dict) -> dict:
    symptoms = parsed_input.get("symptoms", [])
    rule_scores = _rule_based_scores(symptoms)
    # LLM path removed — use rule-based fallback directly
    return _rule_based_fallback(symptoms, parsed_input.get("risk_flags", []), rule_scores)
