"""
modules/explainability.py
M6 — Generates human-readable reasoning for every output.
LLM + structured fallback.
"""
import json
from core.logger import logger
# inference module removed — structured fallback used directly


async def run(
    conditions: list,
    ranked_hospitals: list,
    cost_data: dict,
    confidence: dict,
) -> dict:
    top_hospital = ranked_hospitals[0] if ranked_hospitals else {}
    top_cost = top_hospital.get("cost_estimate", cost_data)
    # LLM path removed — use structured fallback directly
    return _structured_fallback(conditions, top_hospital, top_cost, confidence)


def _structured_fallback(
    conditions: list,
    hospital: dict,
    cost: dict,
    confidence: dict,
) -> dict:
    top = conditions[0] if conditions else {}
    supporting = top.get("supporting_symptoms", [])

    return {
        "why_this_condition": {
            "primary_reason": f"Symptom pattern most consistent with {top.get('name', 'this condition')}",
            "symptom_matches": [f"{s} → supports diagnosis" for s in supporting[:3]],
            "differentiating_factors": top.get("reasoning", "Based on symptom cluster analysis"),
        },
        "why_this_hospital": {
            "specialization_match": f"{hospital.get('name', 'This hospital')} covers {top.get('recommended_specialty', 'the required specialty')}",
            "cost_rationale": f"Estimated ₹{cost.get('estimate', 0):,} within typical range for {hospital.get('tier', 'mid')} tier",
            "overall_justification": (
                f"Ranked #{1} based on specialization fit ({round(hospital.get('score_breakdown', {}).get('specialization', 0) * 100)}%), "
                f"distance ({hospital.get('distance_km', '?')}km), and rating ({hospital.get('rating', '?')}/5)"
            ),
        },
        "cost_derivation": {
            "base_factors": [
                f"Base rate: ₹{hospital.get('base_cost_per_day', 0):,}/day",
                f"Tier multiplier: {hospital.get('tier_factor', 1.0)}×",
                f"Estimated stay: {cost.get('estimated_days', 4)} days",
            ],
            "uncertainty_note": f"±{round((cost.get('max', 0) - cost.get('min', 0)) / max(cost.get('estimate', 1), 1) * 50)}% band due to procedure variability",
            "money_saving_tip": "Request itemized quote upfront. Ask about generic medications and package deals.",
        },
        "confidence_explanation": {
            "score_interpretation": confidence.get("interpretation", ""),
            "limiting_factors": confidence.get("warnings", []),
            "how_to_improve": "Provide age, duration, and existing medical conditions for better accuracy",
        },
        "patient_summary": (
            f"Based on your symptoms, {top.get('name', 'the identified condition')} appears most likely. "
            f"We recommend visiting {hospital.get('name', 'the top-ranked hospital')} "
            f"({hospital.get('area', '')}, {hospital.get('distance_km', '?')}km away). "
            f"Expected cost range: ₹{cost.get('min', 0):,} – ₹{cost.get('max', 0):,}. "
            "Please consult a qualified physician to confirm this assessment."
        ),
        "_source": "structured_fallback",
    }
