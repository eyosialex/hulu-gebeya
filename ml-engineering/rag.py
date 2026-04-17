from data import locations
from osm_search import osm_search
from overpass import overpass_search
from utils import extract_category, clean_query, calculate_distance, DEFAULT_LAT, DEFAULT_LNG

# 1. LOCAL SEARCH
def local_search(query, category=None, lat=None, lng=None):
    query = query.lower()
    cat_label = category["label"] if category else None

    results = [
        {**l, "source": "database"} for l in locations
        if (not cat_label or l["category"] == cat_label) and 
           (l["category"] in query or query in l["name"].lower())
    ]
    
    for r in results:
        r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
        
    return results


# 2. OSM SEARCH
def external_search(query, category=None, lat=None, lng=None):
    try:
        results = osm_search(query, lat=lat, lng=lng)
        for r in results:
            r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
        return results
    except:
        return []


# 3. OVERPASS SEARCH (POI intelligence)
def poi_search(query, category=None, lat=None, lng=None):
    try:
        results = overpass_search(query, category=category, lat=lat, lng=lng)
        for r in results:
            r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
        return results
    except:
        return []


# 4. RETRIEVE (COMBINE EVERYTHING)
def retrieve(query, lat=None, lng=None):
    category = extract_category(query)
    
    local = local_search(query, category=category, lat=lat, lng=lng)
    osm = external_search(query, category=category, lat=lat, lng=lng)
    poi = poi_search(query, category=category, lat=lat, lng=lng)

    return {
        "database": local,
        "osm": osm,
        "overpass": poi,
        "all": local + osm + poi
    }


# 5. RANK (PROXIMITY + RATING)
def rank(results):
    def score(r):
        # Distance score: closer is better (inverse)
        # Assuming 10km is max distance for normalization
        dist = r.get("distance", 10)
        dist_score = max(0, 5 - (dist / 2)) # 0-5 scale
        
        rating = r.get("rating", 0)
        return dist_score + rating

    return sorted(
        results,
        key=score,
        reverse=True
    )


# 6. GENERATE ANSWER
def generate(results):
    if not results:
        return "No places found."

    top = results[0]
    dist_text = f" ({top['distance']:.1f}km away)" if "distance" in top else ""

    return f"Found {len(results)} places. Best match is {top['name']}{dist_text}."


# 7. FULL RAG PIPELINE
def rag_pipeline(query, location=None):
    # Determine the starting coordinates and name
    if location and "lat" in location and "lng" in location:
        lat = location["lat"]
        lng = location["lng"]
        start_label = f"Custom ({lat}, {lng})"
    else:
        lat = DEFAULT_LAT
        lng = DEFAULT_LNG
        start_label = f"AASTU ({lat}, {lng})"
    
    source_data = retrieve(query, lat=lat, lng=lng)
    
    # Add 'start' field to all results
    for result_list in source_data.values():
        for item in result_list:
            item["start"] = start_label
    
    all_results = source_data["all"]
    ranked_results = rank(all_results)
    answer = generate(ranked_results)

    best_place = ranked_results[0] if ranked_results else None

    return {
        "query": query,
        "answer": answer,
        "search_center": {"lat": lat, "lng": lng, "label": start_label},
        "best_place": best_place,
        "sources": {
            "database": source_data["database"],
            "osm": source_data["osm"],
            "overpass": source_data["overpass"]
        }
    }