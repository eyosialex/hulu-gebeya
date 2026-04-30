import re
import math

# Default Location: Addis Ababa Science and Technology University (AASTU)
DEFAULT_LAT = 8.8889
DEFAULT_LNG = 38.8091

# Mapping of keywords to OSM tags / local categories
# These labels MUST match the category values stored in the database.
CATEGORY_MAP = {
    # Food & Drinks
    "hotel": {"osm_tag": '["tourism"="hotel"]', "label": "food"},
    "restaurant": {"osm_tag": '["amenity"="restaurant"]', "label": "food"},
    "food": {"osm_tag": '["amenity"~"restaurant|cafe|food_court"]', "label": "food"},
    "cafe": {"osm_tag": '["amenity"="cafe"]', "label": "food"},
    "coffee": {"osm_tag": '["amenity"="cafe"]', "label": "food"},
    "juice": {"osm_tag": '["amenity"="fast_food"]', "label": "food"},
    "drink": {"osm_tag": '["amenity"="cafe"]', "label": "food"},
    "bar": {"osm_tag": '["amenity"="bar"]', "label": "food"},

    # Health & Wellness (frontend category = 'health')
    "clinic": {"osm_tag": '["amenity"="clinic"]', "label": "health"},
    "hospital": {"osm_tag": '["amenity"="hospital"]', "label": "health"},
    "pharmacy": {"osm_tag": '["amenity"="pharmacy"]', "label": "health"},
    "wellness": {"osm_tag": '["leisure"="fitness_centre"]', "label": "health"},
    "gym": {"osm_tag": '["leisure"="fitness_centre"]', "label": "health"},
    "fitness": {"osm_tag": '["leisure"="fitness_centre"]', "label": "health"},
    "medical": {"osm_tag": '["amenity"="clinic"]', "label": "health"},
    "health": {"osm_tag": '["amenity"="clinic"]', "label": "health"},
    "doctor": {"osm_tag": '["amenity"="clinic"]', "label": "health"},

    # Game Zones
    "game": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},
    "gaming": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},
    "arcade": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},
    "play": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},
    "esport": {"osm_tag": '["leisure"="amusement_arcade"]', "label": "game"},

    # Culture & Faith
    "church": {"osm_tag": '["amenity"="place_of_worship"]["religion"="christian"]', "label": "culture"},
    "mosque": {"osm_tag": '["amenity"="place_of_worship"]["religion"="muslim"]', "label": "culture"},
    "religion": {"osm_tag": '["amenity"="place_of_worship"]', "label": "culture"},
    "worship": {"osm_tag": '["amenity"="place_of_worship"]', "label": "culture"},
    "museum": {"osm_tag": '["tourism"="museum"]', "label": "culture"},
    "art": {"osm_tag": '["tourism"="gallery"]', "label": "culture"},
    "culture": {"osm_tag": '["tourism"="museum"]', "label": "culture"},
    "faith": {"osm_tag": '["amenity"="place_of_worship"]', "label": "culture"},

    # Transport Hubs
    "transport": {"osm_tag": '["public_transport"="stop_area"]', "label": "transport"},
    "bus": {"osm_tag": '["amenity"="bus_station"]', "label": "transport"},
    "taxi": {"osm_tag": '["amenity"="taxi"]', "label": "transport"},
    "station": {"osm_tag": '["public_transport"="station"]', "label": "transport"},
    "airport": {"osm_tag": '["aeroway"="aerodrome"]', "label": "transport"},

    # Study & Education
    "school": {"osm_tag": '["amenity"="school"]', "label": "study"},
    "university": {"osm_tag": '["amenity"="university"]', "label": "study"},
    "study": {"osm_tag": '["amenity"="library"]', "label": "study"},
    "library": {"osm_tag": '["amenity"="library"]', "label": "study"},
    "training": {"osm_tag": '["amenity"="college"]', "label": "study"},
    "college": {"osm_tag": '["amenity"="college"]', "label": "study"},
    "education": {"osm_tag": '["amenity"="school"]', "label": "study"},

    # Local Services
    "bank": {"osm_tag": '["amenity"="bank"]', "label": "services"},
    "atm": {"osm_tag": '["amenity"="atm"]', "label": "services"},
    "shop": {"osm_tag": '["shop"]', "label": "services"},
    "market": {"osm_tag": '["amenity"="marketplace"]', "label": "services"},
    "supermarket": {"osm_tag": '["shop"="supermarket"]', "label": "services"},
    "service": {"osm_tag": '["shop"]', "label": "services"},
    "repair": {"osm_tag": '["shop"="repair"]', "label": "services"},
    "printing": {"osm_tag": '["shop"="printing"]', "label": "services"},

    # Hidden Gems
    "hidden": {"osm_tag": '["tourism"="attraction"]', "label": "hidden_gems"},
    "gem": {"osm_tag": '["tourism"="attraction"]', "label": "hidden_gems"},
    "secret": {"osm_tag": '["tourism"="attraction"]', "label": "hidden_gems"},
    "park": {"osm_tag": '["leisure"="park"]', "label": "hidden_gems"},
    "garden": {"osm_tag": '["leisure"="garden"]', "label": "hidden_gems"},
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
