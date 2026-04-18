import requests

# List of public Overpass API mirrors
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
]

# Simple In-Memory Cache
_geo_cache = {}

def check_geo_validity(lat, lng):
    """
    Ensures logical placement of locations.
    1. Checks bounding box for Addis Ababa.
    2. Checks proximity to infrastructure (roads/buildings) via Overpass.
    Returns a validity score between 0.0 and 1.0.
    """
    # 1. Addis Ababa approximate bounding box
    ADDIS_MIN_LAT = 8.8
    ADDIS_MAX_LAT = 9.2
    ADDIS_MIN_LNG = 38.6
    ADDIS_MAX_LNG = 38.9

    if not (ADDIS_MIN_LAT <= lat <= ADDIS_MAX_LAT and ADDIS_MIN_LNG <= lng <= ADDIS_MAX_LNG):
        return 0.1 

    # 2. Cache Check (Round to 4 decimal places ~11m resolution)
    cache_key = (round(lat, 4), round(lng, 4))
    if cache_key in _geo_cache:
        return _geo_cache[cache_key]

    # 3. Infrastructure Proximity Check
    overpass_query = f"""
    [out:json][timeout:10];
    (
      node(around:100,{lat},{lng})[highway];
      way(around:100,{lat},{lng})[highway];
      node(around:100,{lat},{lng})[building];
      way(around:100,{lat},{lng})[building];
    );
    out count;
    """
    
    headers = {"User-Agent": "SmartMap-GeoConsistency/1.0"}
    
    score = 0.7 # Default fallback
    
    for url in OVERPASS_ENDPOINTS:
        try:
            res = requests.post(url, data={"data": overpass_query}, headers=headers, timeout=5)
            if res.status_code == 200:
                data = res.json()
                total_elements = int(data.get("elements", [{}])[0].get("tags", {}).get("total", 0))
                
                score = 1.0 if total_elements > 0 else 0.4
                break 
        except:
            continue
            
    # Save to cache
    _geo_cache[cache_key] = score
    return score
