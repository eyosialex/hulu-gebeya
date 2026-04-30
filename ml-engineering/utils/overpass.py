import requests
from utils.utils import DEFAULT_LAT, DEFAULT_LNG

# List of public Overpass API mirrors for failover
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]

def overpass_search(query, category=None, lat=None, lng=None):
    # Use provided location or default to AASTU center
    c_lat = lat if lat else DEFAULT_LAT
    c_lng = lng if lng else DEFAULT_LNG
    
    tag_filter = '["name"]'
    if category and "osm_tag" in category:
        tag_filter = category["osm_tag"]

    # Search for nodes matching the tag filter within 2km of center
    overpass_query = f"""
    [out:json][timeout:15];
    node(around:2000,{c_lat},{c_lng}){tag_filter};
    out;
    """
    
    headers = {"User-Agent": "AASTU-SmartMap-RAG/1.0"}
    
    for url in OVERPASS_ENDPOINTS:
        try:
            # POST is often more reliable for Overpass
            res = requests.post(url, data={"data": overpass_query}, headers=headers, timeout=10)
            
            if res.status_code == 200:
                data = res.json()
                results = []
                for el in data.get("elements", []):
                    tags = el.get("tags", {})
                    results.append({
                        "name": tags.get("name", "Unknown"),
                        "lat": el.get("lat"),
                        "lng": el.get("lon"),
                        "rating": 4.2,
                        "source": "overpass",
                        "osm_url": f"https://www.openstreetmap.org/{el['type']}/{el['id']}"
                    })
                
                if results:
                    return results
            else:
                print(f"Overpass Server {url} returned {res.status_code}")
                
        except Exception as e:
            print(f"Overpass Server {url} failure: {e}")
            
    # If all fail, return empty list
    return []
