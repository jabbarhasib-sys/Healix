"""
data/scripts/generate_symptoms.py
Symptom→condition probability mapping dataset.
Run: python data/scripts/generate_symptoms.py
Output: data/synthetic/symptom_conditions.json
"""
import json
import random
from pathlib import Path
 
random.seed(7)
 
# Each entry: condition → list of (symptom, weight)
# Weights represent how strongly that symptom implicates the condition
# Not normalized here — normalization happens in clinical_reasoning.py
 
SYMPTOM_CONDITION_MAP = {
    "STEMI / Acute MI": {
        "icd10": "I21.9",
        "category": "cardiac",
        "urgency": "emergency",
        "specialty": "cardiology",
        "symptoms": {
            "chest pain": 0.90,
            "crushing chest pain": 0.92,
            "chest tightness": 0.80,
            "radiating arm pain": 0.75,
            "left arm pain": 0.72,
            "jaw pain": 0.60,
            "breathlessness": 0.65,
            "sweating": 0.68,
            "nausea": 0.50,
            "palpitations": 0.45,
            "dizziness": 0.40,
            "fatigue": 0.35,
        },
        "red_flags": ["crushing chest pain", "radiating arm pain", "sweating with chest pain"],
    },
    "Unstable Angina": {
        "icd10": "I20.0",
        "category": "cardiac",
        "urgency": "urgent",
        "specialty": "cardiology",
        "symptoms": {
            "chest pain": 0.80,
            "chest tightness": 0.78,
            "breathlessness": 0.55,
            "exertional chest pain": 0.70,
            "palpitations": 0.40,
            "sweating": 0.45,
            "fatigue": 0.40,
        },
        "red_flags": ["chest pain at rest"],
    },
    "Community-Acquired Pneumonia": {
        "icd10": "J18.9",
        "category": "respiratory",
        "urgency": "urgent",
        "specialty": "pulmonology",
        "symptoms": {
            "fever": 0.82,
            "productive cough": 0.85,
            "breathlessness": 0.70,
            "chest pain": 0.50,
            "fatigue": 0.65,
            "chills": 0.60,
            "night sweats": 0.45,
            "malaise": 0.50,
            "haemoptysis": 0.30,
        },
        "red_flags": ["haemoptysis", "breathlessness at rest"],
    },
    "Pulmonary Embolism": {
        "icd10": "I26.9",
        "category": "respiratory",
        "urgency": "emergency",
        "specialty": "pulmonology",
        "symptoms": {
            "sudden breathlessness": 0.88,
            "chest pain": 0.70,
            "haemoptysis": 0.45,
            "leg swelling": 0.55,
            "palpitations": 0.50,
            "dizziness": 0.45,
            "syncope": 0.35,
        },
        "red_flags": ["sudden breathlessness", "syncope"],
    },
    "Migraine": {
        "icd10": "G43.9",
        "category": "neurological",
        "urgency": "routine",
        "specialty": "neurology",
        "symptoms": {
            "headache": 0.90,
            "throbbing headache": 0.88,
            "nausea": 0.72,
            "vomiting": 0.55,
            "vision changes": 0.60,
            "light sensitivity": 0.75,
            "sound sensitivity": 0.70,
            "aura": 0.55,
            "dizziness": 0.45,
            "fatigue": 0.40,
        },
        "red_flags": [],
    },
    "Subarachnoid Haemorrhage": {
        "icd10": "I60.9",
        "category": "neurological",
        "urgency": "emergency",
        "specialty": "neurosurgery",
        "symptoms": {
            "sudden severe headache": 0.95,
            "worst headache of my life": 0.95,
            "neck stiffness": 0.80,
            "vomiting": 0.65,
            "confusion": 0.60,
            "loss of consciousness": 0.55,
            "photophobia": 0.65,
        },
        "red_flags": ["sudden severe headache", "worst headache of my life", "neck stiffness"],
    },
    "Ischaemic Stroke": {
        "icd10": "I63.9",
        "category": "neurological",
        "urgency": "emergency",
        "specialty": "neurology",
        "symptoms": {
            "facial drooping": 0.88,
            "arm weakness": 0.85,
            "slurred speech": 0.85,
            "sudden confusion": 0.78,
            "sudden vision loss": 0.70,
            "severe headache": 0.55,
            "loss of balance": 0.65,
            "numbness": 0.60,
        },
        "red_flags": ["facial drooping", "arm weakness", "slurred speech"],
    },
    "Acute Appendicitis": {
        "icd10": "K35.9",
        "category": "gastrointestinal",
        "urgency": "emergency",
        "specialty": "general surgery",
        "symptoms": {
            "abdominal pain": 0.90,
            "right lower abdominal pain": 0.92,
            "fever": 0.70,
            "nausea": 0.65,
            "vomiting": 0.55,
            "loss of appetite": 0.60,
            "constipation": 0.40,
            "rebound tenderness": 0.80,
        },
        "red_flags": ["right lower abdominal pain with fever"],
    },
    "GORD / Acid Reflux": {
        "icd10": "K21.0",
        "category": "gastrointestinal",
        "urgency": "routine",
        "specialty": "gastroenterology",
        "symptoms": {
            "heartburn": 0.90,
            "acid regurgitation": 0.85,
            "chest discomfort": 0.55,
            "nausea": 0.50,
            "bloating": 0.55,
            "dysphagia": 0.40,
            "sore throat": 0.35,
            "cough": 0.30,
        },
        "red_flags": [],
    },
    "Acute Gastroenteritis": {
        "icd10": "A09",
        "category": "gastrointestinal",
        "urgency": "routine",
        "specialty": "general medicine",
        "symptoms": {
            "diarrhoea": 0.90,
            "vomiting": 0.80,
            "nausea": 0.75,
            "abdominal pain": 0.70,
            "fever": 0.55,
            "cramping": 0.65,
            "loss of appetite": 0.50,
            "fatigue": 0.40,
        },
        "red_flags": ["bloody diarrhoea", "severe dehydration"],
    },
    "Type 2 Diabetes Mellitus": {
        "icd10": "E11.9",
        "category": "endocrine",
        "urgency": "routine",
        "specialty": "endocrinology",
        "symptoms": {
            "excessive thirst": 0.88,
            "frequent urination": 0.88,
            "fatigue": 0.70,
            "weight loss": 0.65,
            "blurred vision": 0.60,
            "slow healing wounds": 0.55,
            "tingling extremities": 0.50,
            "recurrent infections": 0.45,
        },
        "red_flags": [],
    },
    "Hyperthyroidism": {
        "icd10": "E05.9",
        "category": "endocrine",
        "urgency": "routine",
        "specialty": "endocrinology",
        "symptoms": {
            "palpitations": 0.80,
            "weight loss": 0.75,
            "tremor": 0.70,
            "heat intolerance": 0.68,
            "sweating": 0.65,
            "anxiety": 0.60,
            "fatigue": 0.50,
            "diarrhoea": 0.40,
            "insomnia": 0.45,
            "muscle weakness": 0.50,
        },
        "red_flags": [],
    },
    "Rheumatoid Arthritis": {
        "icd10": "M06.9",
        "category": "musculoskeletal",
        "urgency": "routine",
        "specialty": "rheumatology",
        "symptoms": {
            "joint pain": 0.88,
            "joint swelling": 0.85,
            "morning stiffness": 0.82,
            "symmetrical joint involvement": 0.78,
            "fatigue": 0.60,
            "fever": 0.35,
            "weight loss": 0.30,
            "hand pain": 0.75,
        },
        "red_flags": [],
    },
    "Acute Lumbar Disc Prolapse": {
        "icd10": "M51.1",
        "category": "musculoskeletal",
        "urgency": "urgent",
        "specialty": "orthopedics",
        "symptoms": {
            "back pain": 0.88,
            "radiating leg pain": 0.82,
            "sciatica": 0.80,
            "numbness": 0.65,
            "tingling": 0.65,
            "muscle weakness": 0.55,
            "pain worsening on sitting": 0.60,
        },
        "red_flags": ["bowel or bladder dysfunction with back pain"],
    },
    "Urinary Tract Infection": {
        "icd10": "N39.0",
        "category": "renal",
        "urgency": "routine",
        "specialty": "urology",
        "symptoms": {
            "burning urination": 0.90,
            "frequent urination": 0.80,
            "pelvic pain": 0.65,
            "cloudy urine": 0.70,
            "dark urine": 0.55,
            "fever": 0.45,
            "back pain": 0.40,
            "nausea": 0.35,
        },
        "red_flags": ["high fever with flank pain"],
    },
    "Dengue Fever": {
        "icd10": "A97.9",
        "category": "infectious",
        "urgency": "urgent",
        "specialty": "general medicine",
        "symptoms": {
            "fever": 0.92,
            "severe body ache": 0.88,
            "headache": 0.82,
            "rash": 0.65,
            "joint pain": 0.75,
            "muscle pain": 0.78,
            "eye pain": 0.60,
            "fatigue": 0.70,
            "nausea": 0.55,
            "vomiting": 0.45,
        },
        "red_flags": ["petechiae", "bleeding gums", "severe abdominal pain with dengue"],
    },
    "Malaria": {
        "icd10": "B54",
        "category": "infectious",
        "urgency": "urgent",
        "specialty": "general medicine",
        "symptoms": {
            "fever": 0.95,
            "chills": 0.88,
            "sweating": 0.82,
            "headache": 0.75,
            "muscle pain": 0.70,
            "fatigue": 0.65,
            "nausea": 0.55,
            "vomiting": 0.50,
            "cyclical fever": 0.80,
        },
        "red_flags": ["altered consciousness with fever", "severe anaemia"],
    },
    "Asthma Exacerbation": {
        "icd10": "J45.9",
        "category": "respiratory",
        "urgency": "urgent",
        "specialty": "pulmonology",
        "symptoms": {
            "wheezing": 0.92,
            "breathlessness": 0.88,
            "chest tightness": 0.80,
            "cough": 0.75,
            "nocturnal cough": 0.70,
            "exercise intolerance": 0.60,
            "fatigue": 0.40,
        },
        "red_flags": ["silent chest", "inability to speak in sentences"],
    },
    "Hypertensive Crisis": {
        "icd10": "I16.9",
        "category": "cardiac",
        "urgency": "emergency",
        "specialty": "cardiology",
        "symptoms": {
            "severe headache": 0.82,
            "vision changes": 0.70,
            "chest pain": 0.65,
            "breathlessness": 0.60,
            "nausea": 0.55,
            "confusion": 0.50,
            "nosebleed": 0.40,
        },
        "red_flags": ["severe headache with known hypertension", "vision loss with headache"],
    },
    "Sepsis": {
        "icd10": "A41.9",
        "category": "infectious",
        "urgency": "emergency",
        "specialty": "general medicine",
        "symptoms": {
            "fever": 0.85,
            "chills": 0.75,
            "rapid breathing": 0.80,
            "confusion": 0.70,
            "low blood pressure": 0.78,
            "extreme fatigue": 0.72,
            "decreased urination": 0.60,
            "skin mottling": 0.65,
        },
        "red_flags": ["altered consciousness", "rapid breathing with fever", "extremely low BP"],
    },
}
 
 
def generate_training_rows(rows_per_condition: int = 50) -> list[dict]:
    """
    Generates synthetic training rows for ML classifier.
    Each row: binary symptom vector + condition label.
    """
    all_symptoms = sorted({
        sym
        for cond_data in SYMPTOM_CONDITION_MAP.values()
        for sym in cond_data["symptoms"]
    })
 
    rows = []
    for condition, data in SYMPTOM_CONDITION_MAP.items():
        cond_symptoms = data["symptoms"]
        for _ in range(rows_per_condition):
            row = {sym: 0 for sym in all_symptoms}
            # Present symptoms with weighted probability
            for sym, weight in cond_symptoms.items():
                if sym in row:
                    row[sym] = 1 if random.random() < weight else 0
            # Add random noise (co-morbidity simulation)
            for sym in random.sample(all_symptoms, k=random.randint(0, 3)):
                if row[sym] == 0:
                    row[sym] = 1 if random.random() < 0.08 else 0
            row["_condition"] = condition
            row["_category"] = data["category"]
            row["_urgency"] = data["urgency"]
            rows.append(row)
 
    random.shuffle(rows)
    return rows
 
 
if __name__ == "__main__":
    out_dir = Path("data/synthetic")
    out_dir.mkdir(parents=True, exist_ok=True)
 
    # Save mapping
    out_map = out_dir / "symptom_conditions.json"
    with open(out_map, "w") as f:
        json.dump(SYMPTOM_CONDITION_MAP, f, indent=2)
    print(f"Saved {len(SYMPTOM_CONDITION_MAP)} condition mappings → {out_map}")
 
    # Save training CSV
    import csv
    rows = generate_training_rows(50)
    out_csv = out_dir / "symptom_training_data.csv"
    if rows:
        with open(out_csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        print(f"Saved {len(rows)} training rows → {out_csv}")
 