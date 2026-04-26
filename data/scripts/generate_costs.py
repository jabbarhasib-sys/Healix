"""
data/scripts/generate_costs.py
Procedure cost dataset with realistic Indian hospital pricing.
Run: python data/scripts/generate_costs.py
Output: data/synthetic/procedure_costs.json
"""
import json
import random
from pathlib import Path
 
random.seed(13)
 
# (procedure, base_cost_inr, variance_pct, typical_days, risk_multiplier_range)
PROCEDURE_BASE = [
    # Cardiac
    ("Coronary Angiography",        35000,  0.20, 1,  (1.0, 1.3)),
    ("Coronary Angioplasty (PTCA)", 185000, 0.18, 3,  (1.1, 1.5)),
    ("CABG Surgery",                425000, 0.22, 10, (1.2, 1.8)),
    ("Echocardiography",            4500,   0.15, 0,  (1.0, 1.1)),
    ("Cardiac ICU / day",           28000,  0.25, 1,  (1.0, 1.4)),
    ("Pacemaker Implantation",      220000, 0.20, 2,  (1.1, 1.3)),
    ("Holter Monitoring (24h)",     3500,   0.15, 0,  (1.0, 1.1)),
 
    # Neurological
    ("MRI Brain",                   8500,   0.20, 0,  (1.0, 1.2)),
    ("CT Brain",                    3200,   0.18, 0,  (1.0, 1.1)),
    ("Neurosurgery (Craniotomy)",   380000, 0.25, 12, (1.2, 1.9)),
    ("EEG",                         2800,   0.15, 0,  (1.0, 1.1)),
    ("Spinal Surgery",              280000, 0.22, 7,  (1.1, 1.6)),
    ("Lumbar Puncture",             4500,   0.18, 0,  (1.0, 1.1)),
    ("Neurology ICU / day",         22000,  0.28, 1,  (1.0, 1.5)),
 
    # Respiratory
    ("Bronchoscopy",                18000,  0.20, 1,  (1.0, 1.2)),
    ("PFT (Pulmonary Function)",     3200,   0.15, 0,  (1.0, 1.1)),
    ("High Flow Oxygen Therapy/day", 6500,   0.22, 1,  (1.0, 1.3)),
    ("Mechanical Ventilation/day",  18000,  0.30, 1,  (1.1, 1.8)),
    ("Chest Physiotherapy",         1200,   0.15, 0,  (1.0, 1.1)),
 
    # Gastrointestinal
    ("Upper GI Endoscopy",          8500,   0.18, 0,  (1.0, 1.2)),
    ("Colonoscopy",                  9500,   0.18, 0,  (1.0, 1.2)),
    ("Laparoscopic Appendicectomy", 75000,  0.20, 3,  (1.1, 1.4)),
    ("Open Appendicectomy",         55000,  0.22, 5,  (1.1, 1.5)),
    ("Laparoscopic Cholecystectomy",85000,  0.18, 3,  (1.1, 1.3)),
    ("Liver Function Tests",         1800,   0.12, 0,  (1.0, 1.0)),
    ("Ultrasound Abdomen",           1800,   0.15, 0,  (1.0, 1.1)),
 
    # Orthopedic
    ("Hip Replacement (THA)",       220000, 0.22, 7,  (1.1, 1.5)),
    ("Knee Replacement (TKA)",      195000, 0.20, 6,  (1.1, 1.4)),
    ("ORIF Fracture",               85000,  0.22, 4,  (1.1, 1.4)),
    ("Arthroscopy Knee",            65000,  0.18, 2,  (1.0, 1.2)),
    ("Spine Fusion",                320000, 0.25, 8,  (1.2, 1.7)),
    ("Bone Density Scan (DEXA)",    2500,   0.15, 0,  (1.0, 1.0)),
 
    # General / Diagnostic
    ("Complete Blood Count",         600,    0.10, 0,  (1.0, 1.0)),
    ("Metabolic Panel",              1800,   0.12, 0,  (1.0, 1.0)),
    ("X-ray (chest)",               1200,   0.12, 0,  (1.0, 1.0)),
    ("General Consultation",         800,    0.15, 0,  (1.0, 1.0)),
    ("Specialist Consultation",      2500,   0.20, 0,  (1.0, 1.1)),
    ("ICU / day (General)",         18000,  0.28, 1,  (1.0, 1.6)),
    ("HDU / day",                   12000,  0.25, 1,  (1.0, 1.4)),
    ("General Ward / day",           4500,   0.20, 1,  (1.0, 1.2)),
 
    # Oncology
    ("Chemotherapy (per cycle)",    45000,  0.35, 1,  (1.1, 2.0)),
    ("Radiation Therapy (per session)", 8500, 0.25, 0, (1.1, 1.6)),
    ("PET-CT Scan",                 22000,  0.22, 0,  (1.0, 1.2)),
    ("Bone Marrow Biopsy",          18000,  0.22, 0,  (1.0, 1.2)),
    ("Tumour Markers Panel",         4500,   0.18, 0,  (1.0, 1.1)),
 
    # Infectious / General
    ("IV Antibiotics / day",         3500,   0.20, 1,  (1.0, 1.3)),
    ("Dengue NS1/IgM",               1200,   0.12, 0,  (1.0, 1.0)),
    ("Malaria RDT",                   600,    0.10, 0,  (1.0, 1.0)),
    ("Blood Culture",                2200,   0.15, 0,  (1.0, 1.1)),
]
 
_TIER_MULTIPLIERS = {
    "government":      (0.30, 0.55),
    "mid":             (0.85, 1.20),
    "premium":         (1.50, 2.00),
    "super_specialty": (2.00, 3.20),
}
 
_CITY_FACTORS = {
    "Mumbai": 1.22,
    "Delhi":  1.18,
    "Bengaluru": 1.12,
    "Chennai":   1.05,
    "Hyderabad": 1.02,
    "Pune":      0.98,
    "Kolkata":   0.92,
    "Ahmedabad": 0.90,
}
 
 
def build_cost_table() -> list[dict]:
    rows = []
    for proc, base, variance, days, risk_range in PROCEDURE_BASE:
        for tier, (t_min, t_max) in _TIER_MULTIPLIERS.items():
            for city, city_f in _CITY_FACTORS.items():
                tier_f = random.uniform(t_min, t_max)
                noise = random.uniform(1 - variance, 1 + variance)
                cost = round(base * tier_f * city_f * noise, -2)
                rows.append({
                    "procedure": proc,
                    "tier": tier,
                    "city": city,
                    "base_cost": base,
                    "tier_factor": round(tier_f, 3),
                    "city_factor": city_f,
                    "estimated_cost": int(cost),
                    "min_cost": int(cost * (1 - variance * 0.8)),
                    "max_cost": int(cost * (1 + variance * 0.8)),
                    "typical_days": days,
                    "risk_multiplier_low": risk_range[0],
                    "risk_multiplier_high": risk_range[1],
                })
    return rows
 
 
if __name__ == "__main__":
    out_dir = Path("data/synthetic")
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = build_cost_table()
    out_path = out_dir / "procedure_costs.json"
    with open(out_path, "w") as f:
        json.dump(rows, f, indent=2)
    print(f"Generated {len(rows)} cost rows ({len(PROCEDURE_BASE)} procedures × tiers × cities) → {out_path}")
 
    # Also save as CSV for ML training
    import csv
    out_csv = out_dir / "cost_training_data.csv"
    with open(out_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"Training CSV → {out_csv}")