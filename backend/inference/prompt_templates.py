"""
Prompt templates for HEALIX pipeline.
All prompts return strict JSON — no markdown, no preamble.
Tested against llama3.2, mistral, phi3.
"""

SYSTEM_CLINICAL_PARSER = """You are a clinical NLP system. Extract structured medical data from patient input.
Return ONLY valid JSON. No explanation, no markdown, no code fences.
Be precise. If something is unclear, use null not a guess."""


SYSTEM_CLINICAL_REASONER = """You are a board-certified physician's diagnostic AI assistant.
You perform differential diagnosis based on symptoms, applying evidence-based clinical reasoning.
Return ONLY valid JSON. ICD-10 codes must be accurate. Probabilities must sum to 1.0."""


SYSTEM_EXPLAINER = """You are a medical AI transparency system.
Generate clear, plain-English explanations for clinical AI decisions.
Return ONLY valid JSON. Explanations must be factual, not speculative."""


def parse_patient_input(raw_text: str) -> str:
    return f"""Extract clinical data from this patient description:

"{raw_text}"

Return this exact JSON structure:
{{
  "symptoms": ["list of identified symptoms as medical terms"],
  "symptom_duration": "e.g. 2 days, 1 week, or null",
  "severity": "mild | moderate | severe | critical",
  "body_location": "affected body part or null",
  "budget_inr": <number or null>,
  "age_approx": <number or null>,
  "gender": "male | female | unknown",
  "existing_conditions": ["any mentioned chronic conditions"],
  "medications_mentioned": ["any drugs mentioned"],
  "risk_flags": ["list any RED FLAG symptoms: chest pain, difficulty breathing, sudden severe headache, altered consciousness, etc."],
  "ambiguity_score": <0.0-1.0, how vague is the input>,
  "chief_complaint": "one sentence summary"
}}"""


def differential_diagnosis(parsed_input: dict, symptom_context: str = "") -> str:
    symptom_list = ", ".join(parsed_input.get("symptoms", []))
    duration = parsed_input.get("symptom_duration", "unspecified")
    severity = parsed_input.get("severity", "unspecified")
    risk_flags = parsed_input.get("risk_flags", [])
    age = parsed_input.get("age_approx", "unknown")
    gender = parsed_input.get("gender", "unknown")

    risk_section = f"\nRED FLAGS DETECTED: {risk_flags}" if risk_flags else ""

    return f"""Perform differential diagnosis for this patient:

Symptoms: {symptom_list}
Duration: {duration}
Severity: {severity}
Age: {age}, Gender: {gender}
Body location: {parsed_input.get('body_location', 'unspecified')}{risk_section}
{f'Additional context: {symptom_context}' if symptom_context else ''}

Return this exact JSON:
{{
  "conditions": [
    {{
      "name": "Full condition name",
      "icd10_code": "e.g. I21.9",
      "probability": <0.0-1.0>,
      "category": "cardiac | respiratory | neurological | gastrointestinal | infectious | musculoskeletal | endocrine | renal | dermatological | psychiatric | other",
      "urgency": "routine | urgent | emergency",
      "recommended_specialty": "e.g. cardiologist",
      "supporting_symptoms": ["symptoms supporting this diagnosis"],
      "against_symptoms": ["symptoms arguing against this diagnosis"],
      "reasoning": "2-3 sentence clinical reasoning"
    }}
  ],
  "overall_urgency": "routine | urgent | emergency",
  "red_flags_identified": ["list critical warning signs"],
  "recommended_tests": ["top 3 diagnostic tests"],
  "reasoning_chain": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "clinical_summary": "3-4 sentence clinical overview"
}}

Rules:
- Return 3-4 conditions maximum
- Probabilities MUST sum to exactly 1.0
- If any red flag present, mark overall_urgency as emergency
- Be medically accurate, not conservative"""


def explain_decision(
    conditions: list,
    top_hospital: dict,
    cost_estimate: dict,
    confidence: dict,
) -> str:
    top_cond = conditions[0] if conditions else {}
    return f"""Generate explainability report for this clinical AI decision:

Top condition: {top_cond.get('name')} (probability: {top_cond.get('probability')})
Reasoning: {top_cond.get('reasoning')}
Recommended hospital: {top_hospital.get('name')} (score: {top_hospital.get('score')})
Cost estimate: ₹{cost_estimate.get('estimate')} (range: ₹{cost_estimate.get('min')}-₹{cost_estimate.get('max')})
Confidence: {confidence.get('score')}

Return this exact JSON:
{{
  "why_this_condition": {{
    "primary_reason": "main factor driving this diagnosis",
    "symptom_matches": ["key symptom → condition links"],
    "differentiating_factors": "what rules out alternatives"
  }},
  "why_this_hospital": {{
    "specialization_match": "why specialty fits condition",
    "cost_rationale": "affordability reasoning",
    "overall_justification": "2-sentence summary"
  }},
  "cost_derivation": {{
    "base_factors": ["factors used in cost calculation"],
    "uncertainty_note": "why the range exists",
    "money_saving_tip": "practical cost reduction advice"
  }},
  "confidence_explanation": {{
    "score_interpretation": "what this confidence level means",
    "limiting_factors": ["what's reducing confidence"],
    "how_to_improve": "what information would increase accuracy"
  }},
  "patient_summary": "Plain English summary a patient can understand, 3-4 sentences."
}}"""
