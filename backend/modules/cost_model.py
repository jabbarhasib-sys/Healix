"""
modules/cost_model.py
M4 — Stochastic cost estimation.
Outpatient (mild/moderate, non-emergency) → flat consultation fee ~₹800–₹2,500
Inpatient  (severe/critical, emergency)   → per-day hospitalisation formula
Returns min/max range + itemized breakdown.
"""
import random

# Days used ONLY for inpatient cases
_SEVERITY_DAYS = {
    "mild":     1,
    "moderate": 2,
    "severe":   5,
    "critical": 10,
}

# Flat outpatient base consultation cost per visit
_OUTPATIENT_BASE = {
    "mild":     800,
    "moderate": 1500,
    "severe":   3500,
    "critical": 8000,
}

_URGENCY_MULTIPLIER = {
    "routine":   1.0,
    "urgent":    1.15,
    "emergency": 1.50,
}

# Ratios for outpatient breakdown
_RATIOS_OUTPATIENT = {
    "Consultation Fees":    0.40,
    "Diagnostics & Labs":   0.35,
    "Medication":           0.20,
    "Procedures & Surgery": 0.05,
}

# Ratios for inpatient breakdown
_RATIOS_INPATIENT = {
    "Room & Board":         0.38,
    "Diagnostics & Labs":   0.22,
    "Medication":           0.14,
    "Procedures & Surgery": 0.20,
    "Consultation Fees":    0.06,
}

_TIER_OUTPATIENT_MULT = {
    "clinic":         0.70,
    "general":        0.90,
    "specialty":      1.10,
    "super_specialty":1.40,
    "premium":        1.65,
}


def estimate(hospital: dict, severity: str, urgency: str) -> dict:
    urgency_lower = urgency.lower()
    is_emergency = urgency_lower == "emergency"
    is_inpatient = is_emergency or severity in ("severe", "critical")

    noise = random.uniform(0.90, 1.12)

    if is_inpatient:
        base = hospital.get("base_cost_per_day", hospital.get("base_rate", 3000))
        tier_f = hospital.get("tier_factor", 1.0)
        loc_f = hospital.get("location_factor", 1.0)
        risk_f = _URGENCY_MULTIPLIER.get(urgency_lower, 1.0)
        days = _SEVERITY_DAYS.get(severity, 5)
        est = base * tier_f * loc_f * risk_f * days * noise
        ratios = _RATIOS_INPATIENT
    else:
        # Outpatient: realistic low costs for headache, fever, routine visits
        tier = hospital.get("tier", "general")
        base = _OUTPATIENT_BASE.get(severity, 1500)
        tier_mult = _TIER_OUTPATIENT_MULT.get(tier, 1.0)
        est = base * tier_mult * noise
        days = 1
        ratios = _RATIOS_OUTPATIENT

    band_factor = 0.18 if hospital.get("tier") == "government" else 0.12
    if is_emergency:
        band_factor += 0.08

    est_min = round(est * (1 - band_factor))
    est_val = round(est)
    est_max = round(est * (1 + band_factor))

    breakdown = {k: round(est_val * ratio) for k, ratio in ratios.items()}

    tier = hospital.get("tier", "general")
    data_confidence = {
        "government":     0.58,
        "clinic":         0.65,
        "general":        0.72,
        "mid":            0.74,
        "specialty":      0.78,
        "premium":        0.82,
        "super_specialty":0.86,
    }.get(tier, 0.70)
    if is_emergency:
        data_confidence -= 0.08

    return {
        "min":              est_min,
        "estimate":         est_val,
        "max":              est_max,
        "currency":         "INR",
        "estimated_days":   days,
        "breakdown":        breakdown,
        "model_confidence": round(max(0.4, data_confidence + random.gauss(0, 0.03)), 3),
        "disclaimer":       "Estimates based on average costs. Actual may vary. Get a formal quote from the hospital.",
    }
