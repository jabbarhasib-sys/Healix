"""
data/scripts/generate_hospitals.py
Generates 500 realistic Indian hospitals with cost structures.
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
    "Care", "Yashoda", "Rainbow", "Motherhood",
]
_GENERIC = [
    "City", "General", "Central", "Metro", "District", "Regional",
    "Community", "Lifeline", "Medicare", "Wellness", "Sanjeevani",
    "Sanjay Gandhi", "NIMHANS", "Victoria",
]
_SUFFIXES = [
    "Hospital", "Hospitals", "Medical Centre", "Healthcare",
    "Multispecialty Hospital", "Institute of Medical Sciences",
    "Super Speciality Hospital",
]
 
_CITIES = {
    "Bengaluru": {
        "areas": [
            "Bannerghatta Rd", "Koramangala", "Indiranagar", "Whitefield",
            "Jayanagar", "JP Nagar", "HSR Layout", "Bommasandra",
            "Old Airport Rd", "Cunningham Rd", "KR Road", "Yelahanka",
            "Hebbal", "Marathahalli", "Electronic City",
        ],
        "lat_range": (12.85, 13.10),
        "lon_range": (77.50, 77.75),
    },
    "Mumbai": {
        "areas": [
            "Andheri", "Bandra", "Lower Parel", "Mulund", "Thane",
            "Navi Mumbai", "Dadar", "Juhu", "Worli", "Churchgate",
        ],
        "lat_range": (18.90, 19.22),
        "lon_range": (72.80, 73.05),
    },
    "Delhi": {
        "areas": [
            "Saket", "Rohini", "Dwarka", "Karol Bagh", "Vasant Kunj",
            "Greater Kailash", "Pitampura", "Janakpuri", "Lajpat Nagar",
        ],
        "lat_range": (28.50, 28.75),
        "lon_range": (77.05, 77.35),
    },
    "Chennai": {
        "areas": [
            "Anna Nagar", "Adyar", "Velachery", "OMR", "Nungambakkam",
            "T Nagar", "Perambur", "Porur",
        ],
        "lat_range": (12.90, 13.18),
        "lon_range": (80.15, 80.28),
    },
    "Hyderabad": {
        "areas": [
            "Banjara Hills", "Jubilee Hills", "Gachibowli", "Secunderabad",
            "Kukatpally", "Himayatnagar", "Madhapur",
        ],
        "lat_range": (17.33, 17.55),
        "lon_range": (78.35, 78.55),
    },
}
 
_SPECIALTY_POOLS = {
    "super_specialty": [
        "cardiology", "cardiac surgery", "neurology", "neurosurgery",
        "oncology", "haematology", "nephrology", "transplant surgery",
        "bone marrow transplant", "interventional radiology",
        "orthopedics", "spine surgery", "robotic surgery",
    ],
    "premium": [
        "cardiology", "neurology", "oncology", "orthopedics",
        "gastroenterology", "pulmonology", "endocrinology",
        "urology", "nephrology", "obstetrics", "paediatrics",
        "plastic surgery", "ophthalmology", "ENT",
    ],
    "mid": [
        "general medicine", "general surgery", "obstetrics",
        "paediatrics", "orthopaedics", "dermatology",
        "psychiatry", "ophthalmology", "ENT", "urology",
        "physiotherapy", "diabetology",
    ],
    "government": [
        "general medicine", "general surgery", "obstetrics",
        "emergency medicine", "trauma", "paediatrics",
        "infectious disease", "psychiatry",
    ],
}
 
_TIER_CONFIG = {
    "government":     {"cost_range": (800, 2500),  "tier_factor": (0.35, 0.55), "loc_factor": (0.75, 0.95),  "beds": (200, 1200), "er_prob": 0.95, "nabl": 0.15, "jci": 0.0,  "rating": (3.2, 4.2), "count_pct": 0.15},
    "mid":            {"cost_range": (3000, 9000),  "tier_factor": (0.90, 1.35), "loc_factor": (0.88, 1.05),  "beds": (60, 300),   "er_prob": 0.60, "nabl": 0.45, "jci": 0.05, "rating": (3.8, 4.6), "count_pct": 0.50},
    "premium":        {"cost_range": (10000, 22000),"tier_factor": (1.50, 1.90), "loc_factor": (1.00, 1.20),  "beds": (150, 500),  "er_prob": 0.85, "nabl": 0.85, "jci": 0.35, "rating": (4.2, 4.9), "count_pct": 0.28},
    "super_specialty":{"cost_range": (18000, 45000),"tier_factor": (1.90, 2.60), "loc_factor": (1.10, 1.35),  "beds": (100, 350),  "er_prob": 0.75, "nabl": 0.95, "jci": 0.70, "rating": (4.5, 5.0), "count_pct": 0.07},
}
 
_INSURANCE = ["Star Health", "HDFC Ergo", "Care Health", "Bajaj Allianz", "Niva Bupa", "CGHS", "ESI"]
 
 
def _pick_name(tier: str) -> str:
    if tier in ("premium", "super_specialty") and random.random() < 0.65:
        chain = random.choice(_CHAINS)
        suffix = random.choice(_SUFFIXES)
        return f"{chain} {suffix}"
    prefix = random.choice(_GENERIC)
    suffix = random.choice(_SUFFIXES[:3])
    return f"{prefix} {suffix}"
 
 
def _pick_specialties(tier: str) -> list[str]:
    pool = _SPECIALTY_POOLS[tier]
    n = {"government": 4, "mid": 6, "premium": 9, "super_specialty": 12}[tier]
    return random.sample(pool, min(n, len(pool)))
 
 
def generate(n: int = 500) -> list[dict]:
    hospitals = []
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
        er_beds = random.randint(8, 60) if er_capable else 0
        total_beds = random.randint(*cfg["beds"])
 
        hospitals.append({
            "id": f"H{i+1:04d}",
            "name": _pick_name(tier),
            "city": city,
            "area": area,
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
            "insurance_accepted": random.sample(_INSURANCE, random.randint(2, 5)),
        })
 
    return hospitals
 
 
def get_demo_hospitals() -> list[dict]:
    """Small hardcoded set for when DB is empty (dev/demo)."""
    return [
        {"id":"DEMO01","name":"Apollo Hospitals","city":"Bengaluru","area":"Bannerghatta Rd","tier":"premium","rating":4.8,"total_beds":350,"er_beds":24,"er_capable":True,"nabl_certified":True,"jci_certified":True,"latitude":12.8958,"longitude":77.5966,"base_cost_per_day":18000,"tier_factor":1.85,"location_factor":1.15,"specialties":["cardiology","neurology","oncology","orthopedics","respiratory","gastroenterology","general medicine","infectious disease"],"insurance_accepted":["Star Health","HDFC Ergo","Care Health"]},
        {"id":"DEMO02","name":"Manipal Hospital","city":"Bengaluru","area":"Old Airport Rd","tier":"premium","rating":4.7,"total_beds":280,"er_beds":18,"er_capable":True,"nabl_certified":True,"jci_certified":False,"latitude":12.9592,"longitude":77.6489,"base_cost_per_day":16500,"tier_factor":1.75,"location_factor":1.10,"specialties":["cardiology","transplant surgery","paediatrics","orthopedics","neurology","general medicine","oncology"],"insurance_accepted":["Star Health","CGHS"]},
        {"id":"DEMO03","name":"Fortis Hospital","city":"Bengaluru","area":"Cunningham Rd","tier":"premium","rating":4.6,"total_beds":220,"er_beds":15,"er_capable":True,"nabl_certified":True,"jci_certified":False,"latitude":12.9869,"longitude":77.5954,"base_cost_per_day":14000,"tier_factor":1.65,"location_factor":1.05,"specialties":["cardiology","respiratory","infectious disease","general medicine","endocrinology","neurology"],"insurance_accepted":["HDFC Ergo","Bajaj Allianz"]},
        {"id":"DEMO04","name":"Narayana Health","city":"Bengaluru","area":"Bommasandra","tier":"mid","rating":4.5,"total_beds":500,"er_beds":30,"er_capable":True,"nabl_certified":True,"jci_certified":False,"latitude":12.8097,"longitude":77.6798,"base_cost_per_day":9500,"tier_factor":1.20,"location_factor":0.95,"specialties":["cardiology","cardiac surgery","paediatrics","general medicine","infectious disease"],"insurance_accepted":["Star Health","ESI","CGHS"]},
        {"id":"DEMO05","name":"Victoria Hospital","city":"Bengaluru","area":"KR Road","tier":"government","rating":3.8,"total_beds":800,"er_beds":60,"er_capable":True,"nabl_certified":False,"jci_certified":False,"latitude":12.9634,"longitude":77.5756,"base_cost_per_day":1200,"tier_factor":0.40,"location_factor":0.80,"specialties":["general medicine","trauma","infectious disease","paediatrics","obstetrics","emergency medicine"],"insurance_accepted":["CGHS","ESI"]},
        {"id":"DEMO06","name":"Sparsh Hospital","city":"Bengaluru","area":"Infantry Rd","tier":"mid","rating":4.4,"total_beds":80,"er_beds":0,"er_capable":False,"nabl_certified":True,"jci_certified":False,"latitude":12.9854,"longitude":77.6049,"base_cost_per_day":8000,"tier_factor":1.15,"location_factor":1.0,"specialties":["orthopedics","spine surgery","sports medicine","general medicine","physiotherapy"],"insurance_accepted":["Star Health","HDFC Ergo"]},
        {"id":"DEMO07","name":"Sakra World Hospital","city":"Bengaluru","area":"Varthur Rd","tier":"premium","rating":4.7,"total_beds":190,"er_beds":12,"er_capable":True,"nabl_certified":True,"jci_certified":True,"latitude":12.9447,"longitude":77.7071,"base_cost_per_day":15000,"tier_factor":1.70,"location_factor":1.0,"specialties":["neurology","spine surgery","orthopedics","rehabilitation","general medicine","urology"],"insurance_accepted":["Star Health","HDFC Ergo","Care Health","Niva Bupa"]},
        {"id":"DEMO08","name":"BGS Gleneagles Global","city":"Bengaluru","area":"Uttarahalli","tier":"mid","rating":4.3,"total_beds":150,"er_beds":8,"er_capable":True,"nabl_certified":False,"jci_certified":False,"latitude":12.8832,"longitude":77.5434,"base_cost_per_day":7500,"tier_factor":1.10,"location_factor":0.90,"specialties":["general medicine","orthopedics","urology","gastroenterology","respiratory"],"insurance_accepted":["Star Health","Bajaj Allianz"]},
    ]
 
 
if __name__ == "__main__":
    out_dir = Path("data/synthetic")
    out_dir.mkdir(parents=True, exist_ok=True)
    hospitals = generate(500)
    # Inject demo hospitals at front so DB always has known test data
    full = get_demo_hospitals() + hospitals
    out_path = out_dir / "hospitals.json"
    with open(out_path, "w") as f:
        json.dump(full, f, indent=2)
    print(f"Generated {len(full)} hospitals → {out_path}")