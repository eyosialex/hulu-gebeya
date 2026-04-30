"""
rag.py — SmartMap Upgraded RAG Search Pipeline
================================================
10 Search Intelligence Upgrades:

  UPG 1: Intent Extraction     — filters, location, mood from natural language
  UPG 2: Exponential Distance  — VERY close places dominate scoring
  UPG 3: New Ranking Formula   — trust(40%) + dist(25%) + rating(20%) + relevance(15%)
  UPG 4: Fuzzy Name Matching   — "bole cafe" matches "bole coffee shop"
  UPG 5: Adaptive Filtering    — never returns empty (lowers threshold if needed)
  UPG 6: Smarter OSM Trust     — OSM=0.7, Overpass=0.8, boosted if name matches
  UPG 7: Best Match Bias       — high trust + very close = bonus boost
  UPG 8: Guided Gemini Prompt  — structured local guide prompt for better UX
  UPG 9: User Preference Boost — category history influences ranking
  UPG 10: Confidence Output    — returns confidence score with result
"""

import os
import re
import math
import json
from difflib import SequenceMatcher
from google import genai
from dotenv import load_dotenv

from data.data import locations
from utils.osm_search import osm_search
from utils.overpass import overpass_search
from utils.utils import extract_category, clean_query, calculate_distance, DEFAULT_LAT, DEFAULT_LNG
from engines.trust_engine import calculate_trust_score, get_realism_status

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ── UPG 1: Intent Extraction ──────────────────────────────────────────────────

# Keyword → filter tag mapping
_FILTER_KEYWORDS = {
    "verified":  "verified",
    "trusted":   "verified",
    "cheap":     "budget",
    "affordable":"budget",
    "quiet":     "quiet",
    "study":     "quiet",
    "wifi":      "wifi",
    "fast":      "fast",
    "popular":   "popular",
    "rated":     "high_rated",
    "best":      "high_rated",
    "open":      "open_now",
    "near":      "nearby",
    "close":     "nearby",
    "new":       "new",
    "old":       "established",
    "large":     "large",
    "small":     "small",
}

# Addis Ababa district keywords
_LOCATION_KEYWORDS = [
    "bole", "piassa", "merkato", "kazanchis", "cmc", "sarbet",
    "mexico", "4 kilo", "6 kilo", "megenagna", "gerji", "saris",
    "addis", "airport", "stadium", "university", "aastu",
]

def extract_intent(query: str) -> dict:
    """
    UPG 1: Parse query into structured intent object.

    Input : "find a quiet cafe with wifi near bole"
    Output: {
        "category": "food",
        "filters": ["quiet", "wifi"],
        "location_hint": "bole",
        "keywords": ["quiet", "cafe", "wifi", "bole"]
    }
    """
    q = query.lower()

    # Category detection (reuse existing utility)
    category = extract_category(query)

    # Filter extraction
    filters = []
    for keyword, tag in _FILTER_KEYWORDS.items():
        if keyword in q and tag not in filters:
            filters.append(tag)

    # Location hint detection
    location_hint = None
    for loc in _LOCATION_KEYWORDS:
        if loc in q:
            location_hint = loc
            break

    # Raw keywords (clean words, no stop words)
    stop_words = {"find", "a", "an", "the", "near", "me", "in", "at", "with", "for", "and", "or", "to"}
    keywords = [w for w in re.findall(r'\w+', q) if w not in stop_words and len(w) > 2]

    return {
        "category":      category["label"] if category else None,
        "filters":       filters,
        "location_hint": location_hint,
        "keywords":      keywords,
    }


# ── UPG 4: Fuzzy Relevance Scoring ────────────────────────────────────────────

def _text_relevance(query_keywords: list[str], place: dict) -> float:
    """
    UPG 4: Fuzzy text similarity between query and place name/category.
    Uses SequenceMatcher (no external deps).
    Range: 0.0 – 1.0
    """
    target = f"{place.get('name', '')} {place.get('category', '')}".lower()
    query_str = " ".join(query_keywords)

    # Direct substring check (fast path)
    for kw in query_keywords:
        if kw in target:
            return 0.9

    # Fuzzy similarity (difflib)
    sim = SequenceMatcher(None, query_str, target).ratio()

    # Boost if category keyword appears
    cat_words = place.get('category', '').split('_')
    if any(c in query_keywords for c in cat_words):
        sim = min(1.0, sim + 0.2)

    return round(sim, 3)


# ── Step 1: LOCAL SEARCH ──────────────────────────────────────────────────────

def local_search(query: str, intent: dict, lat=None, lng=None) -> list:
    """Search the local database with intent-aware filtering."""
    query_clean = clean_query(query)
    cat_label   = intent.get("category")
    keywords    = intent.get("keywords", [])

    results = []
    for loc in locations:
        match_cat  = cat_label and loc.get("category") == cat_label
        match_name = any(kw in loc["name"].lower() for kw in keywords)
        match_cat2 = loc.get("category", "") in query_clean

        if match_cat or match_name or match_cat2:
            results.append({**loc, "source": "database"})

    for r in results:
        r["distance"] = calculate_distance(lat, lng, r["lat"], r["lng"])
        r["relevance"] = _text_relevance(keywords, r)

    return results


# ── Step 2: OSM SEARCH ────────────────────────────────────────────────────────

def external_search(query: str, intent: dict, lat=None, lng=None) -> list:
    """UPG 6: OSM trust = 0.7 base, boosted if name matches query."""
    try:
        results = osm_search(query, lat=lat, lng=lng)
        keywords = intent.get("keywords", [])
        for r in results:
            r["distance"]  = calculate_distance(lat, lng, r["lat"], r["lng"])
            r["relevance"] = _text_relevance(keywords, r)
            # UPG 6: Base trust 0.7 — boost if name or category matches
            name_match = any(kw in r.get("name", "").lower() for kw in keywords)
            r["trust_score"] = 0.90 if name_match else 0.70
            r["verification_status"] = "Verified (OSM)"
        return results
    except Exception:
        return []


# ── Step 3: OVERPASS SEARCH ───────────────────────────────────────────────────

def poi_search(query: str, intent: dict, lat=None, lng=None) -> list:
    """UPG 6: Overpass trust = 0.8 base, boosted if name matches query."""
    try:
        category = extract_category(query)
        results  = overpass_search(query, category=category, lat=lat, lng=lng)
        keywords = intent.get("keywords", [])
        for r in results:
            r["distance"]  = calculate_distance(lat, lng, r["lat"], r["lng"])
            r["relevance"] = _text_relevance(keywords, r)
            name_match = any(kw in r.get("name", "").lower() for kw in keywords)
            r["trust_score"] = 0.95 if name_match else 0.80
            r["verification_status"] = "Verified (Overpass)"
        return results
    except Exception:
        return []


# ── Step 4: RETRIEVE ──────────────────────────────────────────────────────────

def retrieve(query: str, intent: dict, lat=None, lng=None, fast_mode=False) -> dict:
    """Combine all sources, run Trust Engine on local data, then filter."""

    local = local_search(query, intent, lat=lat, lng=lng)

    if fast_mode:
        osm = []
        poi = []
    else:
        # Trust score local results
        for r in local:
            trust_data = calculate_trust_score(r)
            r["trust_score"]          = trust_data["trust_score"]
            r["trust_breakdown"]      = trust_data["breakdown"]
            r["verification_status"]  = trust_data["status"]

        osm = external_search(query, intent, lat=lat, lng=lng)
        poi = poi_search(query, intent, lat=lat, lng=lng)

    all_results = local + osm + poi

    # UPG 5: Adaptive Filtering — try strict first, fall back if needed
    strict   = [r for r in all_results if r.get("trust_score", 0) >= 0.5 and r.get("name") != "Unknown"]
    moderate = [r for r in all_results if r.get("trust_score", 0) >= 0.3 and r.get("name") != "Unknown"]

    # UPG 5: Never return empty — lower threshold if needed
    filtered = strict if strict else moderate if moderate else all_results[:5]

    return {
        "database": [r for r in filtered if r.get("source") == "database"],
        "osm":      [r for r in filtered if r.get("source") == "osm"],
        "overpass": [r for r in filtered if r.get("source") == "overpass"],
        "all":      filtered,
    }


# ── Step 5: RANK ──────────────────────────────────────────────────────────────

def rank(results: list, intent: dict, user_preferences: list = None) -> list:
    """
    UPG 2 + 3 + 7 + 9: Advanced ranking formula.

    Score = trust(40%) + dist(25%) + rating(20%) + relevance(15%)
    + Best Match Bias (UPG 7)
    + User Preference Boost (UPG 9)
    """
    user_prefs = user_preferences or []

    def score(r):
        # UPG 2: Exponential distance decay — very close dominates
        dist_km      = r.get("distance", 10)
        dist_score   = math.exp(-dist_km)  # 0km=1.0, 0.5km=0.6, 2km=0.1

        trust_score  = r.get("trust_score", 0.5)
        rating_raw   = r.get("rating", 3.0)
        rating_score = (rating_raw - 1.0) / 4.0  # Normalize 1–5 → 0.0–1.0
        relevance    = r.get("relevance", 0.0)

        # UPG 3: Weighted formula
        base = (
            trust_score  * 0.40 +
            dist_score   * 0.25 +
            rating_score * 0.20 +
            relevance    * 0.15
        )

        # UPG 7: Best Match Bias — reward high trust + very close
        if trust_score >= 0.8 and dist_km < 0.5:
            base += 0.20

        # UPG 9: User preference boost
        if r.get("category") in user_prefs:
            base += 0.10

        # UPG 1: Filter tag boosts
        if "verified" in intent.get("filters", []) and trust_score >= 0.75:
            base += 0.10
        if "high_rated" in intent.get("filters", []) and rating_raw >= 4.5:
            base += 0.10
        if "nearby" in intent.get("filters", []) and dist_km < 0.5:
            base += 0.10

        return round(base, 4)

    return sorted(results, key=score, reverse=True)


# ── Step 6: AI GENERATION ─────────────────────────────────────────────────────

def generate(query: str, results: list, intent: dict) -> str:
    """UPG 8: Guided Gemini prompt — structured local guide with trust awareness."""
    if not results:
        return "No reliable locations were found nearby. Try a broader search."

    summary_list = []
    for r in results[:5]:
        dist    = f"{r['distance']:.2f}km" if "distance" in r else "nearby"
        trust   = r.get("trust_score", 0)
        status  = r.get("verification_status", "Unknown")
        rating  = r.get("rating", "N/A")
        summary_list.append(
            f"- {r['name']} ({r.get('category','location')}): "
            f"{dist} away, Rating: {rating}, Trust: {trust:.0%}, Status: {status}"
        )

    context  = "\n".join(summary_list)
    filters  = ", ".join(intent.get("filters", [])) or "none"
    location = intent.get("location_hint") or "the user's area"

    prompt = f"""You are SmartMap AI, a smart local guide for Addis Ababa, Ethiopia.
User asked: "{query}"
User filters detected: {filters}
Searching near: {location}

Top matching locations:
{context}

Instructions:
- Recommend the BEST place FIRST (highest trust + closest)
- Mention distance clearly (e.g. "just 300 metres away")
- Only mention trust/verified status if it is high (>75%)
- Avoid mentioning low-trust places unless they are the only option
- Keep it to 2 sentences max — friendly and concise
- Do NOT make up any place names not in the list above
"""

    try:
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini RAG Generation Error: {e}")
        # Smart fallback
        top = results[0]
        dist = f"{top['distance']:.1f}km" if "distance" in top else "nearby"
        count = len(results)
        if count == 1:
            return f"Best match: {top['name']} ({dist} away, rated {top.get('rating','N/A')})."
        alt = results[1]
        alt_dist = f"{alt['distance']:.1f}km" if "distance" in alt else "nearby"
        return (
            f"Found {count} places. Top pick: {top['name']} ({dist} away). "
            f"Alternative: {alt['name']} ({alt_dist} away)."
        )


# ── UPG 10: Confidence Score ──────────────────────────────────────────────────

def _calculate_confidence(results: list) -> float:
    """
    UPG 10: How confident is the system in the search results?
    Based on: number of results, average trust, avg relevance.
    """
    if not results:
        return 0.0

    n          = min(len(results), 10)
    avg_trust  = sum(r.get("trust_score", 0) for r in results[:n]) / n
    avg_rel    = sum(r.get("relevance", 0)   for r in results[:n]) / n
    count_bonus = min(0.2, n * 0.02)  # More results = more confidence

    confidence = (avg_trust * 0.5) + (avg_rel * 0.3) + count_bonus
    return round(min(1.0, confidence), 3)


# ── FULL RAG PIPELINE ─────────────────────────────────────────────────────────

def rag_pipeline(
    query: str,
    location: dict = None,
    fast_mode: bool = False,
    user_preferences: list = None,
) -> dict:
    """
    Main entry point. Orchestrates all 10 upgrades.

    Args:
        query            : Natural language query
        location         : {"lat": float, "lng": float}
        fast_mode        : True = local DB only (fast), False = all sources
        user_preferences : List of category strings user has visited before
    """
    # Coordinates
    if location and "lat" in location and "lng" in location:
        lat, lng = location["lat"], location["lng"]
        start_label = f"Custom ({lat:.4f}, {lng:.4f})"
    else:
        lat, lng = DEFAULT_LAT, DEFAULT_LNG
        start_label = f"Default ({lat}, {lng})"

    # UPG 1: Intent extraction
    intent = extract_intent(query)

    # Retrieve from all sources
    source_data   = retrieve(query, intent, lat=lat, lng=lng, fast_mode=fast_mode)
    all_results   = source_data["all"]

    # UPG 2+3+7+9: Advanced ranking
    ranked = rank(all_results, intent, user_preferences=user_preferences or [])

    # UPG 8: Guided Gemini answer
    answer = generate(query, ranked, intent)

    # UPG 10: Confidence score
    confidence = _calculate_confidence(ranked)

    best_place = ranked[0] if ranked else None

    return {
        "query":          query,
        "fast_mode":      fast_mode,
        "intent":         intent,          # NEW: show parsed intent
        "confidence":     confidence,      # NEW: system confidence 0–1
        "answer":         answer,
        "search_center":  {"lat": lat, "lng": lng, "label": start_label},
        "best_place":     best_place,
        "total_results":  len(ranked),
        "sources": {
            "database": source_data["database"],
            "osm":      source_data["osm"],
            "overpass": source_data["overpass"],
        },
    }