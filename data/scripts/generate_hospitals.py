"""
data/scripts/generate_hospitals.py
Generates realistic Indian hospitals and neighborhood clinics with real coordinates and cost structures.
Run: python data/scripts/generate_hospitals.py
Output: data/synthetic/hospitals.json
"""
import json
import random
import math
import os
from pathlib import Path

random.seed(42)

# Real hospital chains + generic names
_CHAINS = [
    "Apollo", "Fortis", "Manipal", "Narayana", "Max", "Medanta",
    "Kokilaben", "Lilavati", "Wockhardt", "Columbia Asia", "Aster",
    "Care", "Yashoda", "Rainbow", "Motherhood", "Sakra", "Sparsh",
]
_CLINIC_CHAINS = [
    "Apollo Clinic", "Practo Care Clinic", "MedPlus Health Clinic",
    "Aster Clinic", "Manipal Clinic", "Fortis Health Clinic",
    "Max Care Polyclinic", "Dr. Lal PathLabs & Clinic", "City Family Clinic",
    "Urban Primary Health Centre", "Neighborhood Polyclinic", "Narayana Clinic",
    "Sanjeevani Clinic", "LifeCare Family Clinic", "Pulse Health Clinic"
]
_GENERIC = [
    "City", "General", "Central", "Metro", "District", "Regional",
    "Community", "Lifeline", "Medicare", "Wellness", "Sanjeevani",
    "Sanjay Gandhi", "NIMHANS", "Victoria", "St. John's", "Bowring",
]
_SUFFIXES = [
    "Hospital", "Hospitals", "Medical Centre", "Healthcare",
    "Multispecialty Hospital", "Institute of Medical Sciences",
    "Super Speciality Hospital",
]

_CITIES = {
    "Bangalore": {
        "aliases": ["Bengaluru", "Bangalore"],
        "areas": [
            "Bannerghatta Rd", "Koramangala", "Indiranagar", "Whitefield",
            "Jayanagar", "JP Nagar", "HSR Layout", "Bommasandra",
            "Old Airport Rd", "Cunningham Rd", "KR Road", "Yelahanka",
            "Hebbal", "Marathahalli", "Electronic City", "Malleshwaram",
            "BTM Layout", "Rajajinagar", "Sarjapur Road", "Bellandur"
        ],
        "lat_range": (12.85, 13.10),
        "lon_range": (77.50, 77.75),
    },
    "Bengaluru": {
        "aliases": ["Bengaluru", "Bangalore"],
        "areas": [
            "Bannerghatta Rd", "Koramangala", "Indiranagar", "Whitefield",
            "Jayanagar", "JP Nagar", "HSR Layout", "Bommasandra",
            "Old Airport Rd", "Cunningham Rd", "KR Road", "Yelahanka",
            "Hebbal", "Marathahalli", "Electronic City", "Malleshwaram",
            "BTM Layout", "Rajajinagar", "Sarjapur Road", "Bellandur"
        ],
        "lat_range": (12.85, 13.10),
        "lon_range": (77.50, 77.75),
    },
    "Mumbai": {
        "aliases": ["Mumbai", "Bombay"],
        "areas": [
            "Andheri", "Bandra", "Lower Parel", "Mulund", "Thane",
            "Navi Mumbai", "Dadar", "Juhu", "Worli", "Churchgate",
            "Borivali", "Goregaon", "Powai", "Vile Parle"
        ],
        "lat_range": (18.90, 19.25),
        "lon_range": (72.80, 73.05),
    },
    "Delhi": {
        "aliases": ["Delhi", "New Delhi"],
        "areas": [
            "Saket", "Rohini", "Dwarka", "Karol Bagh", "Vasant Kunj",
            "Greater Kailash", "Pitampura", "Janakpuri", "Lajpat Nagar",
            "Connaught Place", "Okhla", "Sarita Vihar"
        ],
        "lat_range": (28.50, 28.75),
        "lon_range": (77.05, 77.35),
    },
    "Chennai": {
        "aliases": ["Chennai", "Madras"],
        "areas": [
            "Anna Nagar", "Adyar", "Velachery", "OMR", "Nungambakkam",
            "T Nagar", "Perambur", "Porur", "Mylapore", "Guindy"
        ],
        "lat_range": (12.90, 13.18),
        "lon_range": (80.15, 80.28),
    },
    "Hyderabad": {
        "aliases": ["Hyderabad", "Secunderabad"],
        "areas": [
            "Banjara Hills", "Jubilee Hills", "Gachibowli", "Secunderabad",
            "Kukatpally", "Himayatnagar", "Madhapur", "Kondapur", "Begumpet"
        ],
        "lat_range": (17.33, 17.55),
        "lon_range": (78.35, 78.55),
    },
    "Pune": {
        "aliases": ["Pune", "Poona"],
        "areas": [
            "Kothrud", "Aundh", "Viman Nagar", "Hinjewadi", "Baner",
            "Shivajinagar", "Hadapsar", "Kalyani Nagar", "Deccan"
        ],
        "lat_range": (18.45, 18.65),
        "lon_range": (73.75, 73.95),
    },
    "Kolkata": {
        "aliases": ["Kolkata", "Calcutta"],
        "areas": [
            "Salt Lake", "Park Street", "Ballygunge", "Alipore", "New Town",
            "Howrah", "Jadavpur", "Garia", "Behala", "Dum Dum"
        ],
        "lat_range": (22.45, 22.65),
        "lon_range": (88.30, 88.48),
    }
}

_SPECIALTY_POOLS = {
    "clinic": [
        "general medicine", "family medicine", "paediatrics", "dermatology",
        "diabetology", "physiotherapy", "cardiology", "orthopedics", "gynaecology"
    ],
    "government": [
        "general medicine", "general surgery", "obstetrics",
        "emergency medicine", "trauma", "paediatrics",
        "infectious disease", "psychiatry", "pulmonology"
    ],
    "mid": [
        "general medicine", "general surgery", "obstetrics",
        "paediatrics", "orthopedics", "dermatology",
        "psychiatry", "ophthalmology", "ENT", "urology",
        "physiotherapy", "diabetology", "cardiology"
    ],
    "premium": [
        "cardiology", "neurology", "oncology", "orthopedics",
        "gastroenterology", "pulmonology", "endocrinology",
        "urology", "nephrology", "obstetrics", "paediatrics",
        "plastic surgery", "ophthalmology", "ENT", "general medicine"
    ],
    "super_specialty": [
        "cardiology", "cardiac surgery", "neurology", "neurosurgery",
        "oncology", "haematology", "nephrology", "transplant surgery",
        "bone marrow transplant", "interventional radiology",
        "orthopedics", "spine surgery", "robotic surgery", "pulmonology"
    ],
}

_TIER_CONFIG = {
    "clinic":         {"cost_range": (300, 1500),   "tier_factor": (0.25, 0.45), "loc_factor": (0.70, 0.90),  "beds": (0, 10),     "er_prob": 0.10, "nabl": 0.40, "jci": 0.0,  "rating": (4.1, 4.9), "count_pct": 0.30},
    "government":     {"cost_range": (600, 2500),   "tier_factor": (0.35, 0.55), "loc_factor": (0.75, 0.95),  "beds": (200, 1200), "er_prob": 0.95, "nabl": 0.15, "jci": 0.0,  "rating": (3.5, 4.3), "count_pct": 0.15},
    "mid":            {"cost_range": (3000, 9000),  "tier_factor": (0.90, 1.35), "loc_factor": (0.88, 1.05),  "beds": (50, 250),   "er_prob": 0.65, "nabl": 0.55, "jci": 0.05, "rating": (3.9, 4.6), "count_pct": 0.25},
    "premium":        {"cost_range": (10000, 22000),"tier_factor": (1.50, 1.90), "loc_factor": (1.00, 1.20),  "beds": (150, 500),  "er_prob": 0.85, "nabl": 0.85, "jci": 0.35, "rating": (4.3, 4.9), "count_pct": 0.20},
    "super_specialty":{"cost_range": (18000, 45000),"tier_factor": (1.90, 2.60), "loc_factor": (1.10, 1.35),  "beds": (100, 400),  "er_prob": 0.90, "nabl": 0.95, "jci": 0.70, "rating": (4.5, 5.0), "count_pct": 0.10},
}

_INSURANCE = ["Star Health", "HDFC Ergo", "Care Health", "Bajaj Allianz", "Niva Bupa", "CGHS", "ESI", "Max Bupa"]


def _pick_name(tier: str, area: str) -> str:
    if tier == "clinic":
        prefix = random.choice(_CLINIC_CHAINS)
        return f"{prefix} ({area})"
    if tier in ("premium", "super_specialty") and random.random() < 0.70:
        chain = random.choice(_CHAINS)
        suffix = random.choice(_SUFFIXES)
        return f"{chain} {suffix}"
    prefix = random.choice(_GENERIC)
    suffix = random.choice(_SUFFIXES[:3])
    return f"{prefix} {suffix}"


def _pick_specialties(tier: str) -> list[str]:
    pool = _SPECIALTY_POOLS[tier]
    n = {"clinic": 3, "government": 5, "mid": 6, "premium": 9, "super_specialty": 12}[tier]
    return random.sample(pool, min(n, len(pool)))


def generate(n: int = 500) -> list[dict]:
    facilities = []
    tiers = list(_TIER_CONFIG.keys())
    weights = [_TIER_CONFIG[t]["count_pct"] for t in tiers]

    for i in range(n):
        tier = random.choices(tiers, weights=weights)[0]
        cfg = _TIER_CONFIG[tier]

        city = random.choice(list(_CITIES.keys()))
        city_cfg = _CITIES[city]
        area = random.choice(city_cfg["areas"])

        lat = random.uniform(*city_cfg["lat_range"])
        lon = random.uniform(*city_cfg["lon_range"])

        er_capable = random.random() < cfg["er_prob"]
        er_beds = random.randint(4, 50) if er_capable else 0
        total_beds = random.randint(*cfg["beds"])
        is_clinic = (tier == "clinic")

        name = _pick_name(tier, area)

        facilities.append({
            "id": f"FAC{i+1:04d}",
            "name": name,
            "city": city,
            "area": area,
            "facility_type": "clinic" if is_clinic else "hospital",
            "tier": tier,
            "rating": round(random.uniform(*cfg["rating"]), 1),
            "total_beds": total_beds,
            "er_beds": er_beds,
            "er_capable": er_capable,
            "nabl_certified": random.random() < cfg["nabl"],
            "jci_certified": random.random() < cfg["jci"],
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "base_cost_per_day": round(random.uniform(*cfg["cost_range"]), -2),
            "tier_factor": round(random.uniform(*cfg["tier_factor"]), 3),
            "location_factor": round(random.uniform(*cfg["loc_factor"]), 3),
            "specialties": _pick_specialties(tier),
            "insurance_accepted": random.sample(_INSURANCE, random.randint(1, 4)),
        })

    return facilities


def get_curated_bangalore_facilities() -> list[dict]:
    """Curated real Bangalore hospitals & local neighborhood clinics."""
    return [
        # ── Bangalore Major Hospitals ──
        {
            "id": "BLR_H01", "name": "Manipal Hospital", "city": "Bangalore", "area": "Old Airport Rd",
            "facility_type": "hospital", "tier": "premium", "rating": 4.8, "total_beds": 650, "er_beds": 35,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 12.9592, "longitude": 77.6489,
            "base_cost_per_day": 16500, "tier_factor": 1.75, "location_factor": 1.10,
            "specialties": ["cardiology", "cardiac surgery", "neurology", "pulmonology", "gastroenterology", "orthopedics", "general medicine", "emergency medicine"],
            "insurance_accepted": ["Star Health", "HDFC Ergo", "Care Health", "CGHS"]
        },
        {
            "id": "BLR_H02", "name": "Narayana Health City", "city": "Bangalore", "area": "Bommasandra",
            "facility_type": "hospital", "tier": "super_specialty", "rating": 4.9, "total_beds": 1400, "er_beds": 60,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 12.8097, "longitude": 77.6798,
            "base_cost_per_day": 12000, "tier_factor": 1.40, "location_factor": 0.95,
            "specialties": ["cardiology", "cardiac surgery", "nephrology", "oncology", "neurology", "general medicine", "paediatrics"],
            "insurance_accepted": ["Star Health", "ESI", "CGHS", "HDFC Ergo"]
        },
        {
            "id": "BLR_H03", "name": "Apollo Hospital Bannerghatta", "city": "Bangalore", "area": "Bannerghatta Rd",
            "facility_type": "hospital", "tier": "premium", "rating": 4.8, "total_beds": 250, "er_beds": 20,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 12.8958, "longitude": 77.5966,
            "base_cost_per_day": 18000, "tier_factor": 1.85, "location_factor": 1.15,
            "specialties": ["cardiology", "pulmonology", "neurology", "gastroenterology", "orthopedics", "general medicine", "infectious disease"],
            "insurance_accepted": ["Star Health", "HDFC Ergo", "Care Health", "Niva Bupa"]
        },
        {
            "id": "BLR_H04", "name": "NIMHANS (National Institute of Mental Health & Neuro Sciences)", "city": "Bangalore", "area": "Hosur Road",
            "facility_type": "hospital", "tier": "super_specialty", "rating": 4.9, "total_beds": 800, "er_beds": 40,
            "er_capable": True, "nabl_certified": True, "jci_certified": False, "latitude": 12.9405, "longitude": 77.5986,
            "base_cost_per_day": 2500, "tier_factor": 0.50, "location_factor": 0.85,
            "specialties": ["neurology", "neurosurgery", "psychiatry", "brain", "nerve", "emergency medicine"],
            "insurance_accepted": ["CGHS", "ESI", "Star Health"]
        },
        {
            "id": "BLR_H05", "name": "Fortis Hospital Cunningham Road", "city": "Bangalore", "area": "Cunningham Rd",
            "facility_type": "hospital", "tier": "premium", "rating": 4.7, "total_beds": 150, "er_beds": 15,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 12.9869, "longitude": 77.5954,
            "base_cost_per_day": 16000, "tier_factor": 1.70, "location_factor": 1.10,
            "specialties": ["cardiology", "cardiac surgery", "pulmonology", "infectious disease", "general medicine"],
            "insurance_accepted": ["HDFC Ergo", "Bajaj Allianz", "Star Health"]
        },
        {
            "id": "BLR_H06", "name": "Aster CMI Hospital", "city": "Bangalore", "area": "Hebbal",
            "facility_type": "hospital", "tier": "premium", "rating": 4.7, "total_beds": 500, "er_beds": 30,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 13.0562, "longitude": 77.5912,
            "base_cost_per_day": 15000, "tier_factor": 1.65, "location_factor": 1.05,
            "specialties": ["gastroenterology", "liver transplant", "cardiology", "pulmonology", "orthopedics", "general medicine"],
            "insurance_accepted": ["Star Health", "Care Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_H07", "name": "Sakra World Hospital", "city": "Bangalore", "area": "Marathahalli / Bellandur",
            "facility_type": "hospital", "tier": "premium", "rating": 4.7, "total_beds": 350, "er_beds": 25,
            "er_capable": True, "nabl_certified": True, "jci_certified": True, "latitude": 12.9288, "longitude": 77.6844,
            "base_cost_per_day": 15500, "tier_factor": 1.70, "location_factor": 1.05,
            "specialties": ["orthopedics", "neurology", "spine surgery", "cardiology", "general medicine", "rehabilitation"],
            "insurance_accepted": ["Star Health", "HDFC Ergo", "Care Health", "Niva Bupa"]
        },
        {
            "id": "BLR_H08", "name": "St. John's Medical College Hospital", "city": "Bangalore", "area": "Koramangala",
            "facility_type": "hospital", "tier": "mid", "rating": 4.6, "total_beds": 1350, "er_beds": 50,
            "er_capable": True, "nabl_certified": True, "jci_certified": False, "latitude": 12.9304, "longitude": 77.6186,
            "base_cost_per_day": 4500, "tier_factor": 0.85, "location_factor": 0.90,
            "specialties": ["general medicine", "infectious disease", "cardiology", "neurology", "paediatrics", "emergency medicine"],
            "insurance_accepted": ["CGHS", "ESI", "Star Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_H09", "name": "Victoria Hospital & Bowring Medical", "city": "Bangalore", "area": "KR Road / City Market",
            "facility_type": "hospital", "tier": "government", "rating": 4.0, "total_beds": 1200, "er_beds": 80,
            "er_capable": True, "nabl_certified": False, "jci_certified": False, "latitude": 12.9634, "longitude": 77.5756,
            "base_cost_per_day": 1000, "tier_factor": 0.35, "location_factor": 0.80,
            "specialties": ["general medicine", "trauma", "infectious disease", "emergency medicine", "burns", "surgery"],
            "insurance_accepted": ["CGHS", "ESI", "Ayushman Bharat"]
        },

        # ── Bangalore Local Clinics & Polyclinics (Neighborhoods) ──
        {
            "id": "BLR_C01", "name": "Apollo Clinic Indiranagar", "city": "Bangalore", "area": "Indiranagar",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.7, "total_beds": 5, "er_beds": 2,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9784, "longitude": 77.6408,
            "base_cost_per_day": 800, "tier_factor": 0.30, "location_factor": 1.0,
            "specialties": ["general medicine", "family medicine", "paediatrics", "dermatology", "diabetology", "cardiology"],
            "insurance_accepted": ["Star Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_C02", "name": "MedPlus Health Clinic Koramangala", "city": "Bangalore", "area": "Koramangala",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.6, "total_beds": 3, "er_beds": 1,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9352, "longitude": 77.6245,
            "base_cost_per_day": 500, "tier_factor": 0.25, "location_factor": 0.95,
            "specialties": ["general medicine", "family medicine", "fever", "diabetology", "infectious disease"],
            "insurance_accepted": ["Star Health", "Care Health"]
        },
        {
            "id": "BLR_C03", "name": "Practo Care Clinic HSR Layout", "city": "Bangalore", "area": "HSR Layout",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.8, "total_beds": 4, "er_beds": 2,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9116, "longitude": 77.6389,
            "base_cost_per_day": 700, "tier_factor": 0.28, "location_factor": 0.95,
            "specialties": ["general medicine", "orthopedics", "gastroenterology", "physiotherapy", "family medicine"],
            "insurance_accepted": ["Star Health", "HDFC Ergo", "Bajaj Allianz"]
        },
        {
            "id": "BLR_C04", "name": "Aster Clinic Whitefield", "city": "Bangalore", "area": "Whitefield",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.7, "total_beds": 6, "er_beds": 2,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9698, "longitude": 77.7499,
            "base_cost_per_day": 900, "tier_factor": 0.32, "location_factor": 1.0,
            "specialties": ["general medicine", "paediatrics", "pulmonology", "cardiology", "dermatology"],
            "insurance_accepted": ["Star Health", "Care Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_C05", "name": "Manipal Clinic Jayanagar", "city": "Bangalore", "area": "Jayanagar",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.8, "total_beds": 8, "er_beds": 2,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9299, "longitude": 77.5833,
            "base_cost_per_day": 950, "tier_factor": 0.35, "location_factor": 1.0,
            "specialties": ["general medicine", "cardiology", "orthopedics", "neurology", "diabetology"],
            "insurance_accepted": ["Star Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_C06", "name": "Urban Primary Health Centre JP Nagar", "city": "Bangalore", "area": "JP Nagar",
            "facility_type": "clinic", "tier": "government", "rating": 4.2, "total_beds": 10, "er_beds": 4,
            "er_capable": True, "nabl_certified": False, "jci_certified": False, "latitude": 12.9063, "longitude": 77.5857,
            "base_cost_per_day": 200, "tier_factor": 0.15, "location_factor": 0.80,
            "specialties": ["general medicine", "family medicine", "fever", "immunization", "infectious disease"],
            "insurance_accepted": ["Ayushman Bharat", "CGHS", "ESI"]
        },
        {
            "id": "BLR_C07", "name": "Dr. Lal PathLabs & Polyclinic BTM Layout", "city": "Bangalore", "area": "BTM Layout",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.5, "total_beds": 2, "er_beds": 0,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.9166, "longitude": 77.6101,
            "base_cost_per_day": 600, "tier_factor": 0.25, "location_factor": 0.90,
            "specialties": ["general medicine", "diagnostics", "diabetology", "thyroid", "family medicine"],
            "insurance_accepted": ["Star Health", "HDFC Ergo"]
        },
        {
            "id": "BLR_C08", "name": "Apollo Clinic Electronic City", "city": "Bangalore", "area": "Electronic City",
            "facility_type": "clinic", "tier": "clinic", "rating": 4.6, "total_beds": 5, "er_beds": 2,
            "er_capable": False, "nabl_certified": True, "jci_certified": False, "latitude": 12.8452, "longitude": 77.6602,
            "base_cost_per_day": 850, "tier_factor": 0.30, "location_factor": 0.95,
            "specialties": ["general medicine", "family medicine", "orthopedics", "physiotherapy", "paediatrics"],
            "insurance_accepted": ["Star Health", "HDFC Ergo", "Care Health"]
        }
    ]


if __name__ == "__main__":
    out_dir = Path("data/synthetic")
    out_dir.mkdir(parents=True, exist_ok=True)
    generated = generate(500)
    curated = get_curated_bangalore_facilities()
    full = curated + generated
    out_path = out_dir / "hospitals.json"
    with open(out_path, "w") as f:
        json.dump(full, f, indent=2)
    print(f"Generated {len(full)} facilities (hospitals & clinics) -> {out_path}")