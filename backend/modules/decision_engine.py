"""
modules/decision_engine.py
M3 — Multi-factor hospital ranking.
Score = w1*specialization + w2*cost_fit + w3*distance + w4*rating
Weights shift dynamically based on urgency + budget.
"""
import math
import random
from core.logger import logger


def _weights(urgency: str, budget_inr: float | None) -> dict:
    if urgency == "emergency":
        return {"spec": 0.28, "cost": 0.08, "dist": 0.44, "rating": 0.20}
    if budget_inr and budget_inr < 50_000:
        return {"spec": 0.25, "cost": 0.45, "dist": 0.15, "rating": 0.15}
    if budget_inr and budget_inr > 300_000:
        return {"spec": 0.42, "cost": 0.12, "dist": 0.18, "rating": 0.28}
    # Default balanced
    return {"spec": 0.35, "cost": 0.25, "dist": 0.20, "rating": 0.20}


def _distance_score(hospital: dict, user_lat: float = 12.97, user_lon: float = 77.59) -> float:
    """Haversine if real coords available, otherwise mock."""
    lat = hospital.get("latitude") or 12.97
    lon = hospital.get("longitude") or 77.59
    dlat = math.radians(lat - user_lat)
    dlon = math.radians(lon - user_lon)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(user_lat)) * math.cos(math.radians(lat)) * math.sin(dlon/2)**2
    dist_km = 6371 * 2 * math.asin(math.sqrt(a))
    if dist_km < 0.5:
        dist_km = random.uniform(1.5, 15.0)  # realistic noise for demo data
    return max(0.0, 1.0 - (dist_km / 30.0)), round(dist_km, 1)


def _spec_score(hospital: dict, target_specialties: list[str]) -> float:
    if not target_specialties:
        return 0.6
    hosp_specs = [s.lower() for s in hospital.get("specialties", [])]
    targets = [t.lower() for t in target_specialties]
    matches = sum(
        1 for t in targets
        if any(t in hs or hs in t for hs in hosp_specs)
    )
    return min(1.0, matches / max(len(targets), 1))


def _cost_fit_score(hospital: dict, budget_inr: float | None, days: int = 4) -> float:
    if budget_inr is None:
        return 0.6
    estimated = hospital.get("base_cost_per_day", 5000) * hospital.get("tier_factor", 1.0) * days
    if estimated <= budget_inr:
        return min(1.0, 0.5 + 0.5 * (budget_inr - estimated) / budget_inr)
    # Over budget — penalise proportionally
    over_ratio = (estimated - budget_inr) / budget_inr
    return max(0.0, 1.0 - over_ratio)


def _rating_score(hospital: dict) -> float:
    rating = hospital.get("rating", 4.0)
    return max(0.0, (rating - 1.0) / 4.0)  # normalise 1-5 → 0-1


def rank(
    hospitals: list[dict],
    conditions: list[dict],
    urgency: str,
    budget_inr: float | None,
) -> tuple[list[dict], dict]:
    if not hospitals:
        return [], {}

    target_specs = list({
        c.get("recommended_specialty", "")
        for c in (conditions or [])[:2]
        if c.get("recommended_specialty")
    })

    w = _weights(urgency, budget_inr)
    avg_days = {"routine": 3, "urgent": 5, "emergency": 8}.get(urgency, 4)

    scored = []
    for h in hospitals:
        # Emergency: skip non-ER hospitals entirely
        if urgency == "emergency" and not h.get("er_capable"):
            continue

        spec = _spec_score(h, target_specs)
        dist_score, dist_km = _distance_score(h)
        cost = _cost_fit_score(h, budget_inr, avg_days)
        rating = _rating_score(h)

        raw_score = (
            w["spec"] * spec
            + w["cost"] * cost
            + w["dist"] * dist_score
            + w["rating"] * rating
        )
        # Tiny realistic noise
        noise = random.gauss(0, 0.012)
        final_score = round(max(0.0, min(1.0, raw_score + noise)), 4)

        scored.append({
            **h,
            "score": final_score,
            "score_breakdown": {
                "specialization": round(spec, 3),
                "cost_fit": round(cost, 3),
                "distance": round(dist_score, 3),
                "rating": round(rating, 3),
            },
            "distance_km": dist_km,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    logger.debug(
        f"M3 ranked {len(scored)} hospitals | "
        f"top={scored[0]['name'] if scored else 'none'} | weights={w}"
    )
    return scored, w
