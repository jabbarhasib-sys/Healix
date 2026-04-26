"""
modules/input_understanding.py
M1 — Converts raw patient text → structured clinical JSON.
Dual-path: LLM (primary) with regex fallback.
"""
import re
import json
from core.logger import logger
from inference import router as llm
from inference.prompt_templates import SYSTEM_CLINICAL_PARSER, parse_patient_input


_SYMPTOM_PATTERNS = [
    "chest pain", "chest tightness", "breathlessness", "shortness of breath",
    "palpitations", "headache", "migraine", "dizziness", "vertigo", "syncope",
    "fever", "chills", "night sweats", "fatigue", "weakness", "malaise",
    "cough", "dry cough", "productive cough", "wheezing", "haemoptysis",
    "nausea", "vomiting", "diarrhoea", "constipation", "abdominal pain",
    "bloating", "heartburn", "dysphagia", "jaundice", "dark urine",
    "back pain", "joint pain", "muscle pain", "swelling", "stiffness",
    "rash", "itching", "urticaria", "numbness", "tingling", "tremor",
    "confusion", "memory loss", "seizure", "loss of consciousness",
    "weight loss", "weight gain", "excessive thirst", "frequent urination",
    "sore throat", "runny nose", "nasal congestion", "earache", "toothache",
    "eye pain", "vision changes", "blurred vision", "chest tightness",
]

_BUDGET_RE = re.compile(r"(?:rs\.?|₹|inr)\s*(\d[\d,]*)", re.I)
_BUDGET_WORD_RE = re.compile(r"(\d+)\s*(?:thousand|k|lakh|lakhs|l\b)", re.I)
_DURATION_RE = re.compile(r"(\d+)\s*(hour|day|week|month|year)s?", re.I)
_SEVERITY_HIGH = re.compile(r"\b(severe|worst|excruciating|crushing|unbearable|extreme|very bad)\b", re.I)
_SEVERITY_LOW = re.compile(r"\b(mild|slight|minor|little|bit of|occasional)\b", re.I)


def _regex_parse(text: str) -> dict:
    lo = text.lower()
    symptoms = list({s for s in _SYMPTOM_PATTERNS if s in lo})

    budget = None
    if m := _BUDGET_RE.search(text):
        budget = int(m.group(1).replace(",", ""))
    elif m := _BUDGET_WORD_RE.search(text):
        val, unit = int(m.group(1)), m.group(2).lower()
        budget = val * (100000 if "lakh" in unit else 1000)

    duration = None
    if m := _DURATION_RE.search(text):
        duration = f"{m.group(1)} {m.group(2)}s"

    severity = "moderate"
    if _SEVERITY_HIGH.search(text):
        severity = "severe"
    elif _SEVERITY_LOW.search(text):
        severity = "mild"

    flags = []
    if any(s in lo for s in ["chest pain", "crushing", "radiating"]):
        flags.append("possible_cardiac_event")
    if any(s in lo for s in ["worst headache", "sudden severe headache", "thunderclap"]):
        flags.append("possible_subarachnoid_haemorrhage")
    if any(s in lo for s in ["difficulty breathing", "can't breathe", "cannot breathe"]):
        flags.append("respiratory_compromise")

    return {
        "symptoms": symptoms,
        "symptom_duration": duration,
        "severity": severity,
        "body_location": None,
        "budget_inr": budget,
        "age_approx": None,
        "gender": "unknown",
        "existing_conditions": [],
        "medications_mentioned": [],
        "risk_flags": flags,
        "ambiguity_score": max(0.0, 1.0 - min(len(symptoms) / 4.0, 1.0)),
        "chief_complaint": symptoms[:2] and f"{', '.join(symptoms[:2])} with {duration or 'unspecified duration'}" or text[:80],
        "_source": "regex_fallback",
    }


async def run(raw_input: str) -> dict:
    if len(raw_input.strip()) < 10:
        raise ValueError("Input too short — at minimum describe your main symptom.")

    try:
        raw_json = await llm.complete(
            prompt=parse_patient_input(raw_input),
            system=SYSTEM_CLINICAL_PARSER,
            temperature=0.1,
            max_tokens=800,
        )
        parsed = json.loads(raw_json)
        parsed["_source"] = "llm"
        logger.debug(f"M1 parsed {len(parsed.get('symptoms', []))} symptoms via LLM")
        return parsed
    except Exception as e:
        logger.warning(f"M1 LLM parse failed ({e}), using regex fallback")
        return _regex_parse(raw_input)
