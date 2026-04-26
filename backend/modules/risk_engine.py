"""modules/risk_engine.py — M-side: emergency detection + ranking override"""

_EMERGENCY_SYMPTOMS = {
    "chest pain", "crushing chest pain", "chest tightness", "radiating arm pain",
    "difficulty breathing", "shortness of breath", "can't breathe",
    "sudden severe headache", "worst headache of my life", "thunderclap headache",
    "loss of consciousness", "syncope", "altered consciousness", "confusion",
    "stroke", "facial drooping", "arm weakness", "slurred speech",
    "severe bleeding", "haemoptysis", "coughing blood",
    "seizure", "convulsion", "anaphylaxis", "allergic reaction",
    "severe abdominal pain", "rigid abdomen",
}

_EMERGENCY_FLAGS = {
    "possible_cardiac_event", "possible_subarachnoid_haemorrhage",
    "respiratory_compromise",
}


def evaluate(parsed_input: dict, clinical_output: dict) -> dict:
    symptoms_lower = {s.lower() for s in parsed_input.get("symptoms", [])}
    risk_flags = set(parsed_input.get("risk_flags", []))
    red_flags = set(clinical_output.get("red_flags_identified", []))
    overall_urgency = clinical_output.get("overall_urgency", "routine")

    symptom_match = symptoms_lower & _EMERGENCY_SYMPTOMS
    flag_match = risk_flags & _EMERGENCY_FLAGS
    llm_emergency = overall_urgency == "emergency"

    is_emergency = bool(symptom_match or flag_match or llm_emergency)

    urgency_level = (
        "emergency" if is_emergency
        else "urgent" if overall_urgency == "urgent"
        else "routine"
    )

    emergency_reasons = list(symptom_match | flag_match)
    if llm_emergency and not emergency_reasons:
        emergency_reasons = red_flags or ["Clinical pattern indicates emergency"]

    return {
        "is_emergency": is_emergency,
        "urgency_level": urgency_level,
        "emergency_reasons": list(emergency_reasons)[:3],
        "override_applied": is_emergency,
        "recommended_action": (
            "CALL 108 / GO TO ER IMMEDIATELY" if is_emergency
            else "See a specialist within 24-48h" if urgency_level == "urgent"
            else "Schedule appointment with recommended specialist"
        ),
    }
