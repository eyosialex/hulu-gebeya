import requests

from utils.utils import clean_query

def osm_search(query, lat=None, lng=None):
    url = "https://nominatim.openstreetmap.org/search"

    subject = clean_query(query)

    params = {
        "q": subject,
        "format": "json",
        "limit": 10
    }

    if lat and lng:
        # Create a local bounding box (~5km) around the user
        # 0.045 degrees is roughly 5km
        viewbox = f"{lng-0.045},{lat+0.045},{lng+0.045},{lat-0.045}"
        params["viewbox"] = viewbox
        params["bounded"] = 1 # Force results to stay inside the box
    else:
        # Fallback to whole Addis Ababa
        params["viewbox"] = "38.6,9.1,38.9,8.8"
        params["bounded"] = 1

    headers = {"User-Agent": "SmartMap-RAG"}

    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    return [
        {
            "name": item["display_name"],
            "lat": float(item["lat"]),
            "lng": float(item["lon"]),
            "rating": 4.0,
            "source": "osm",
            "osm_url": f"https://www.openstreetmap.org/{item['osm_type']}/{item['osm_id']}"
        }
        for item in data
    ]