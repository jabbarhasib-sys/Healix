"""
api/places.py
Free hospital search — no API key, no billing.
Uses OpenStreetMap Nominatim (geocoding) + Overpass API (hospital search).
100% free, no credit card required.
"""
import httpx
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/places", tags=["places"])

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL  = "https://overpass-api.de/api/interpreter"

# Map specialty → OSM amenity tags / name keywords for filtering
_SPECIALTY_TAGS = {
    "Cardiology":       ["cardiac", "heart", "cardio"],
    "Neurology":        ["neuro", "brain", "spine"],
    "Pulmonology":      ["chest", "pulmo", "lung", "respiratory"],
    "Gastroenterology": ["gastro", "digestive", "liver"],
    "Orthopedics":      ["ortho", "bone", "joint", "spine"],
    "Nephrology":       ["kidney", "nephro", "urology", "renal"],
    "Infectious":       ["infectious", "fever", "tropical"],
    "General Medicine": [],   # no keyword filter — return all hospitals
}

HEADERS = {"User-Agent": "HealixAI/1.0 (jabbar.hasib@gmail.com)"}


async def _geocode(city: str) -> tuple[float, float]:
    """Returns (lat, lng) for a city using Nominatim."""
    async with httpx.AsyncClient(timeout=10, headers=HEADERS) as client:
        r = await client.get(NOMINATIM_URL, params={
            "q": f"{city}, India",
            "format": "json",
            "limit": 1,
        })
        results = r.json()
    if not results:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
    return float(results[0]["lat"]), float(results[0]["lon"])


async def _find_hospitals(lat: float, lng: float, radius: int = 8000) -> list[dict]:
    """Returns hospitals within radius metres using Overpass API."""
    query = f"""
    [out:json][timeout:20];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lng});
      way["amenity"="hospital"](around:{radius},{lat},{lng});
      node["amenity"="clinic"](around:{radius},{lat},{lng});
    );
    out body center 20;
    """
    async with httpx.AsyncClient(timeout=25, headers=HEADERS) as client:
        r = await client.post(OVERPASS_URL, data={"data": query})
        data = r.json()
    return data.get("elements", [])


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Straight-line distance between two lat/lng points in km."""
    import math
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
    return round(R * 2 * math.asin(math.sqrt(a)), 1)


def _maps_url(lat: float, lon: float, name: str) -> str:
    import urllib.parse
    return f"https://www.google.com/maps/search/{urllib.parse.quote(name)}/@{lat},{lon},15z"


@router.get("/hospitals")
async def get_nearby_hospitals(
    city:      str = Query(..., description="City name e.g. Mumbai"),
    specialty: str = Query("General Medicine", description="Medical specialty"),
    radius:    int = Query(8000, description="Search radius in metres"),
    lat:       float = Query(None, description="Exact latitude"),
    lng:       float = Query(None, description="Exact longitude"),
):
    """
    Returns real hospitals near the user. If lat/lng are provided, searches 
    around exact coordinates. Otherwise, geocodes the city center.
    """
    # 1. Determine center point (User coords OR City center)
    if lat is not None and lng is not None:
        actual_lat, actual_lng = lat, lng
    else:
        actual_lat, actual_lng = await _geocode(city)

    # 2. Fetch hospitals from Overpass
    elements = await _find_hospitals(actual_lat, actual_lng, radius)

    # 3. Filter & enrich
    keywords = _SPECIALTY_TAGS.get(specialty, [])
    hospitals = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en")
        if not name:
            continue

        specialty_match = not keywords or any(k in name.lower() for k in keywords)

        el_lat = el.get("lat") or el.get("center", {}).get("lat", actual_lat)
        el_lon = el.get("lon") or el.get("center", {}).get("lon", actual_lng)

        dist = _haversine_km(actual_lat, actual_lng, float(el_lat), float(el_lon))

        hospitals.append({
            "name":               name,
            "address":            ", ".join(filter(None, [
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
                tags.get("addr:suburb") or tags.get("addr:city") or city,
            ])) or city,
            "rating":             None,
            "user_ratings_total": None,
            "photo_url":          None,
            "maps_url":           _maps_url(float(el_lat), float(el_lon), name),
            "open_now":           None,
            "distance_km":        dist,
            "specialty_match":    specialty_match,
            "phone":              tags.get("phone") or tags.get("contact:phone"),
            "website":            tags.get("website") or tags.get("contact:website"),
            "emergency":          tags.get("emergency") == "yes",
        })

    if not hospitals:
        raise HTTPException(status_code=404, detail=f"No hospitals found near you.")

    # Sort: specialty matches first, then by distance
    hospitals.sort(key=lambda h: (not h["specialty_match"], h["distance_km"]))

    return {
        "city":      city,
        "specialty": specialty,
        "lat":       actual_lat,
        "lng":       actual_lng,
        "source":    "OpenStreetMap (free)",
        "hospitals": hospitals[:8],
    }
