"""
modules/cost_model.py
M4 — Realistic cost estimation.
Outpatient (mild/moderate, non-emergency) → ₹300–₹3,000 (consultation + basic tests)
Inpatient  (severe/critical, emergency)   → per-day hospitalisation formula
"""
import random

# Days used ONLY for inpatient cases
_SEVERITY_DAYS = {
    "mild":     1,
    "moderate": 2,
    "severe":   4,
    "critical": 8,
}

# Flat outpatient costs — realistic India private hospital consultation
_OUTPATIENT_BASE = {
    "mild":     350,    # GP visit: ₹300-₹500
    "moderate": 900,    # Specialist visit + basic tests: ₹700-₹1,200
    "severe":   2500,   # Urgent visit + workup: ₹2,000-₹3,500
    "critical": 6000,   # Emergency outpatient: ₹5,000-₹8,000
}

# Per-day inpatient base (replaces whatever the DB has if it's unrealistic)
_INPATIENT_BASE = {
    "mild":     1500,
    "moderate": 2500,
    "severe":   5000,
    "critical": 9000,
}

_URGENCY_MULTIPLIER = {
    "routine":   1.0,
    "urgent":    1.10,
    "emergency": 1.35,
}

# Outpatient tier multipliers (consultation costs)
_TIER_OUTPATIENT_MULT = {
    "government":     0.35,
    "clinic":         0.60,
    "general":        0.85,
    "mid":            1.00,
    "specialty":      1.20,
    "super_specialty": 1.50,
    "premium":        1.80,
}

# Inpatient tier multipliers (room + board + procedures)
_TIER_INPATIENT_MULT = {
    "government":     0.40,
    "clinic":         0.70,
    "general":        0.90,
    "mid":            1.00,
    "specialty":      1.30,
    "super_specialty": 1.70,
    "premium":        2.20,
}

_RATIOS_OUTPATIENT = {
    "Consultation Fees":    0.45,
    "Diagnostics & Labs":   0.35,
    "Medication":           0.15,
    "Procedures & Surgery": 0.05,
}

_RATIOS_INPATIENT = {
    "Room & Board":         0.38,
    "Diagnostics & Labs":   0.22,
    "Medication":           0.14,
    "Procedures & Surgery": 0.20,
    "Consultation Fees":    0.06,
}


def estimate(hospital: dict, severity: str, urgency: str) -> dict:
    urgency_lower = urgency.lower()
    is_emergency = urgency_lower == "emergency"
    # Only use inpatient formula for truly serious cases
    is_inpatient = is_emergency or severity in ("severe", "critical")

    noise = random.uniform(0.92, 1.10)
    tier  = hospital.get("tier", "mid")
    urgency_mult = _URGENCY_MULTIPLIER.get(urgency_lower, 1.0)

    if is_inpatient:
        # Use severity-based base — ignore whatever DB has (often unrealistic default ₹5k/day)
        base = _INPATIENT_BASE.get(severity, 2500)
        tier_mult = _TIER_INPATIENT_MULT.get(tier, 1.0)
        days = _SEVERITY_DAYS.get(severity, 2)
        est  = base * tier_mult * urgency_mult * days * noise
        ratios = _RATIOS_INPATIENT
    else:
        # Outpatient — realistic consultation + tests
        base = _OUTPATIENT_BASE.get(severity, 900)
        tier_mult = _TIER_OUTPATIENT_MULT.get(tier, 1.0)
        est  = base * tier_mult * noise
        days = 1
        ratios = _RATIOS_OUTPATIENT

    band = 0.15 + (0.08 if is_emergency else 0)
    est_min = round(est * (1 - band))
    est_val = round(est)
    est_max = round(est * (1 + band))

    breakdown = {k: round(est_val * ratio) for k, ratio in ratios.items()}

    data_confidence = {
        "government":      0.58,
        "clinic":          0.65,
        "general":         0.72,
        "mid":             0.74,
        "specialty":       0.78,
        "premium":         0.82,
        "super_specialty": 0.86,
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
        "disclaimer":       "Estimates based on average Indian private hospital rates. Actual costs may vary.",
    }
