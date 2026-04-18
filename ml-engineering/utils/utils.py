import re
import math

# Default Location: Addis Ababa Science and Technology University (AASTU)
DEFAULT_LAT = 8.8889
DEFAULT_LNG = 38.8091

# Mapping of keywords to OSM tags / local categories
CATEGORY_MAP = {
    # Food & Drinks
    "hotel": {"osm_tag": '["tourism"="hotel"]', "label": "hotel"},
    "restaurant": {"osm_tag": '["amenity"="restaurant"]', "label": "food"},
    "food": {"osm_tag": '["amenity"~"restaurant|cafe|food_court"]', "label": "food"},
    "cafe": {"osm_tag": '["amenity"="cafe"]', "label": "food"},
    "coffee": {"osm_tag": '["amenity"="cafe"]', "label": "food"},
    "juice": {"osm_tag": '["amenity"="fast_food"]["cuisine"="juice"]', "label": "food"},
    "street food": {"osm_tag": '["amenity"="fast_food"]["street_vendor"="yes"]', "label": "food"},
    
    # Entertainment
    "game": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},
    "football": {"osm_tag": '["leisure"="pitch"]["sport"="soccer"]', "label": "entertainment"},
    "cinema": {"osm_tag": '["amenity"="cinema"]', "label": "entertainment"},
    "park": {"osm_tag": '["leisure"="park"]', "label": "entertainment"},
    
    # Shops & Business
    "market": {"osm_tag": '["shop"="convenience"]', "label": "shop"},
    "mini market": {"osm_tag": '["shop"="convenience"]', "label": "shop"},
    "clothing": {"osm_tag": '["shop"="clothes"]', "label": "shop"},
    "shop": {"osm_tag": '["shop"]', "label": "shop"},
    "electronics": {"osm_tag": '["shop"="electronics"]', "label": "shop"},
    
    # Services
    "clinic": {"osm_tag": '["amenity"="clinic"]', "label": "services"},
    "pharmacy": {"osm_tag": '["amenity"="pharmacy"]', "label": "services"},
    "bank": {"osm_tag": '["amenity"="bank"]', "label": "services"},
    "atm": {"osm_tag": '["amenity"="atm"]', "label": "services"},
    "printing": {"osm_tag": '["shop"="printing"]', "label": "services"},
    
    # Education
    "school": {"osm_tag": '["amenity"="school"]', "label": "education"},
    "university": {"osm_tag": '["amenity"="university"]', "label": "education"},
    "training": {"osm_tag": '["amenity"="training"]', "label": "education"},
    
    # Religious
    "church": {"osm_tag": '["amenity"="place_of_worship"]["religion"="christian"]', "label": "church"},
    "mosque": {"osm_tag": '["amenity"="place_of_worship"]["religion"="muslim"]', "label": "mosque"},
    
    # Others
    "repair": {"osm_tag": '["shop"="repair"]', "label": "hidden_gems"},
    "market": {"osm_tag": '["amenity"="marketplace"]', "label": "temporary"}
}

def extract_category(query):
    query = query.lower()
    # Sort keys by length descending to match longer phrases (like 'mini market') first
    sorted_keys = sorted(CATEGORY_MAP.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key in query:
            return CATEGORY_MAP[key]
    return None

def clean_query(query):
    # Remove common filler words and local context to isolate the subject
    stopwords = [
        "is there", "any", "search for", "find a", "find", "show me", 
        "in adis abeba", "in addis ababa", "in addis", "around here",
        "near me", "nearby", "near to the me", "near to the"
    ]
    
    cleaned = query.lower()
    for word in stopwords:
        cleaned = cleaned.replace(word, "")
    
    # Strip leading/trailing articles and small words
    cleaned = re.sub(r'\ba\b|\ban\b|\bthe\b', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth in km."""
    if None in (lat1, lon1, lat2, lon2):
        return 999.0
        
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
