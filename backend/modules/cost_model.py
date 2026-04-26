"""
modules/cost_model.py
M4 — Stochastic cost estimation.
Cost = BaseCost × TierFactor × LocationFactor × RiskMultiplier × noise
Returns min/max range + itemized breakdown.
"""
import random
import math

_SEVERITY_DAYS = {
    "mild": 2,
    "moderate": 4,
    "severe": 7,
    "critical": 12,
}

_URGENCY_MULTIPLIER = {
    "routine": 1.0,
    "urgent": 1.25,
    "emergency": 1.55,
}

_ITEMIZED_RATIOS = {
    "Room & Board": 0.38,
    "Diagnostics & Labs": 0.22,
    "Medication": 0.14,
    "Procedures & Surgery": 0.20,
    "Consultation Fees": 0.06,
}


def estimate(hospital: dict, severity: str, urgency: str) -> dict:
    base = hospital.get("base_cost_per_day", 5000.0)
    tier_f = hospital.get("tier_factor", 1.0)
    loc_f = hospital.get("location_factor", 1.0)
    risk_f = _URGENCY_MULTIPLIER.get(urgency, 1.0)
    days = _SEVERITY_DAYS.get(severity, 4)

    # Core estimate with bounded noise to simulate real-world variance
    noise = random.uniform(0.88, 1.14)
    est = base * tier_f * loc_f * risk_f * days * noise

    # Uncertainty band widens for government hospitals (less data) and emergency
    band_factor = 0.20 if hospital.get("tier") == "government" else 0.15
    if urgency == "emergency":
        band_factor += 0.08

    est_min = round(est * (1 - band_factor))
    est_val = round(est)
    est_max = round(est * (1 + band_factor))

    breakdown = {
        k: round(est_val * ratio)
        for k, ratio in _ITEMIZED_RATIOS.items()
    }

    # Model confidence degrades with sparse data indicators
    tier = hospital.get("tier", "mid")
    data_confidence = {"government": 0.58, "mid": 0.74, "premium": 0.82, "super_specialty": 0.86}.get(tier, 0.70)
    if urgency == "emergency":
        data_confidence -= 0.08

    return {
        "min": est_min,
        "estimate": est_val,
        "max": est_max,
        "currency": "INR",
        "estimated_days": days,
        "breakdown": breakdown,
        "model_confidence": round(max(0.4, data_confidence + random.gauss(0, 0.03)), 3),
        "disclaimer": "Estimates based on average costs. Actual may vary. Get formal quote from hospital.",
    }
