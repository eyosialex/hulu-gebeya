from data.data import locations
from utils.osm_search import osm_search
from utils.overpass import overpass_search
from utils.utils import extract_category, clean_query, calculate_distance, DEFAULT_LAT, DEFAULT_LNG
from engines.trust_engine import calculate_trust_score, get_realism_status
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 1. LOCAL SEARCH
def local_search(query, category=None, lat=None, lng=None):
    query_clean = clean_query(query)
    cat_label = category["label"] if category else None

    results = []
    for l in locations:
        # Match if category label matches OR if query keywords are in the name
        match_cat = cat_label and l.get("category") == cat_label
        match_name = query_clean in l["name"].lower() or l["category"] in query_clean
        
        if match_cat or match_name:
            results.append({**l, "source": "database"})
    
    for r in results:
        r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
        
    return results


# 2. OSM SEARCH
def external_search(query, category=None, lat=None, lng=None):
    try:
        results = osm_search(query, lat=lat, lng=lng)
        for r in results:
            r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
            # OSM IS 100% CORRECT (PER USER INSTRUCTION)
            r["trust_score"] = 1.0
            r["verification_status"] = "Verified"
        return results
    except:
        return []


# 3. OVERPASS SEARCH (POI intelligence)
def poi_search(query, category=None, lat=None, lng=None):
    try:
        results = overpass_search(query, category=category, lat=lat, lng=lng)
        for r in results:
            r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
            # OVERPASS IS 100% CORRECT (PER USER INSTRUCTION)
            r["trust_score"] = 1.0
            r["verification_status"] = "Verified"
        return results
    except:
        return []


# 4. RETRIEVE (COMBINE EVERYTHING)
def retrieve(query, lat=None, lng=None, fast_mode=False):
    category = extract_category(query)
    
    local = local_search(query, category=category, lat=lat, lng=lng)
    
    if fast_mode:
        all_results = local
        osm = []
        poi = []
    else:
        # CALCULATE TRUST ONLY FOR LOCAL DATABASE
        for r in local:
            trust_data = calculate_trust_score(r)
            r["trust_score"] = trust_data["trust_score"]
            r["trust_breakdown"] = trust_data["breakdown"]
            r["verification_status"] = trust_data["status"]
            
        osm = external_search(query, category=category, lat=lat, lng=lng)
        poi = poi_search(query, category=category, lat=lat, lng=lng)
        all_results = local + osm + poi
    
    # --- STRICT FILTERS (USER REQUEST) ---
    # 1. Eliminate any result marked as "Fake / Suspicious" (Database entries < 0.5)
    # 2. Eliminate any result with "Unknown" name (Overpass cleanup)
    filtered_all = [
        r for r in all_results 
        if r["trust_score"] >= 0.5 and r.get("name") != "Unknown"
    ]

    return {
        "database": [r for r in filtered_all if r["source"] == "database"],
        "osm": [r for r in filtered_all if r["source"] == "osm"],
        "overpass": [r for r in filtered_all if r["source"] == "overpass"],
        "all": filtered_all
    }


# 5. RANK (PROXIMITY + RATING * TRUST)
def rank(results):
    def score(r):
        # Distance score: closer is better (0-5 scale)
        dist = r.get("distance", 10)
        dist_score = max(0, 5 - (dist / 2))
        
        rating = r.get("rating", 0)
        trust = r.get("trust_score", 1.0) # Official data is already 1.0
        
        # New formula: Trust acts as a multiplier
        # Even a close match is penalized if it's suspicious
        return (dist_score + rating) * trust

    return sorted(
        results,
        key=score,
        reverse=True
    )

# 6. GENERATE ANSWER (AI POWERED)
def generate(query, results):
    if not results:
        return "No reliable locations were found for this area. Please check back later."

    # Prepare a summary of results for Gemini
    summary_list = []
    for r in results[:5]:  # Top 5 only
        dist = f"{r['distance']:.2f}km" if "distance" in r else "unknown distance"
        summary_list.append(
            f"- {r['name']} ({r.get('category', 'location')}): {dist} away, Rating: {r.get('rating', 'N/A')}, Status: {r.get('verification_status', 'Unknown')}"
        )
    
    context = "\n".join(summary_list)
    prompt = f"""
    You are SmartMap AI, a helpful location assistant.
    User asked: "{query}"
    Found the following results:
    {context}
    
    Generate a human-readable, friendly summary response (1-2 sentences). 
    Mention the best match and maybe one alternative if available.
    Be concise but helpful. Example: "There are 4 game zones near Bole. The closest is X (0.6 km) and is highly rated."
    """
    
    try:
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini RAG Generation Error: {e}")
        # --- SMART FALLBACK ---
        if not results:
            return "No reliable locations were found."
            
        top = results[0]
        count = len(results)
        dist = f"{top['distance']:.1f}km" if "distance" in top else "nearby"
        
        if count == 1:
            return f"Found 1 reliable result: {top['name']} ({dist} away). It is currently rated {top.get('rating', 'N/A')} and is {top.get('verification_status', 'Verified')}."
        else:
            alt = results[1]
            alt_dist = f"{alt['distance']:.1f}km" if "distance" in alt else "nearby"
            return f"I found {count} places matching your query. The best match is {top['name']} ({dist} away). Another option is {alt['name']} ({alt_dist} away)."


# 7. FULL RAG PIPELINE
def rag_pipeline(query, location=None, fast_mode=False):
    # Determine the starting coordinates and name
    if location and "lat" in location and "lng" in location:
        lat = location["lat"]
        lng = location["lng"]
        start_label = f"Custom ({lat}, {lng})"
    else:
        lat = DEFAULT_LAT
        lng = DEFAULT_LNG
        start_label = f"AASTU ({lat}, {lng})"
    
    source_data = retrieve(query, lat=lat, lng=lng, fast_mode=fast_mode)
    
    # Add 'start' field to all results
    for result_list in source_data.values():
        for item in result_list:
            item["start"] = start_label
    
    all_results = source_data["all"]
    ranked_results = rank(all_results)
    answer = generate(query, ranked_results)

    best_place = ranked_results[0] if ranked_results else None

    return {
        "query": query,
        "fast_mode": fast_mode,
        "answer": answer,
        "search_center": {"lat": lat, "lng": lng, "label": start_label},
        "best_place": best_place,
        "sources": {
            "database": source_data["database"],
            "osm": source_data["osm"],
            "overpass": source_data["overpass"]
        }
    }