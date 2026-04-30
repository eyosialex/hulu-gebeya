"""
analysis.py  (Layer 3 — Scene Classification)
==============================================
Upgraded Gemini Vision analysis that returns scene type, confidence,
and description in addition to labels and text.

Migrated from deprecated google.generativeai to google.genai.
"""

import os
import io
import json
import requests
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
_API_KEY = os.getenv("GEMINI_API_KEY")

if _API_KEY and _API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    _client = genai.Client(api_key=_API_KEY)
    _ACTIVE = True
else:
    _client = None
    _ACTIVE = False

# ── Category → valid scene types mapping ──────────────────────────────────────
CATEGORY_SCENE_MAP = {
    "game":    ["game_zone", "arcade", "gaming_hall", "entertainment_center", "playstation_spot", "pool_house"],
    "food":    ["restaurant", "cafe", "food_court", "bakery", "bar", "traditional_ethiopian_restaurant", "coffee_shop", "juice_house"],
    "clinic":  ["clinic", "hospital", "medical_facility", "pharmacy", "health_center", "dental_office", "laboratory"],
    "church":  ["church", "chapel", "cathedral", "mosque", "orthodox_church", "religious_site"],
    "hotel":   ["hotel", "lodge", "guesthouse", "accommodation", "boutique_hotel", "pension"],
    "school":  ["school", "college", "university", "classroom", "library", "training_center"],
    "shop":    ["shop", "store", "market", "supermarket", "boutique", "mall", "clothing_store", "mobile_shop"],
    "bank":    ["bank", "financial_institution", "atm", "microfinance", "insurance_office"],
    "gym":     ["gym", "fitness_center", "sports_facility", "workout_room", "bodybuilding_gym", "yoga_studio"],
    "office":  ["office", "corporate_building", "workspace", "co_working", "government_office"],
}


def classify_scene(image_url: str = None, image_bytes: bytes = None, location_name: str = "") -> dict:
    """
    Layer 3: Analyzes image scene and classifies it.
    
    Fallback Order:
      1. Gemini 2.0 Flash
      2. Gemini 1.5 Flash (if 429)
      3. Smart Heuristic Simulation (based on keywords)
    """
    if not image_bytes and image_url:
        image_bytes = _download(image_url)
    if not image_bytes:
        return _simulate_analysis(image_url, location_name=location_name)

    # ── Try Gemini (2.0 first, then 1.5) ─────────────────────────────────────
    if _ACTIVE:
        try:
            return _analyze_with_gemini(image_bytes, model="gemini-2.0-flash")
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print("  [SCENE] Gemini 2.0 exhausted, trying flash-lite...")
                try:
                    return _analyze_with_gemini(image_bytes, model="gemini-2.0-flash-lite")
                except Exception as e2:
                    print(f"  [SCENE] gemini-2.0-flash-lite also failed: {e2}")
            else:
                print(f"  [SCENE] Gemini error: {e}")

    return _simulate_analysis(image_url, location_name=location_name)


def _analyze_with_gemini(image_bytes: bytes, model: str = "gemini-2.0-flash") -> dict:
    """Internal helper for Gemini analysis."""
    try:
        prompt = """
        You are a scene classification expert analyzing a real-world location photo in an urban environment (Ethiopia).
        Carefully identify scene_type using specific, granular labels:
        - "ethiopian coffee shop" or "modern cafe"
        - "traditional restaurant" or "modern diner"
        - "commercial gym interior" or "outdoor sports field"
        - "boutique shop" or "large supermarket"
        - "orthodox church" or "modern mosque"
        - "private clinic" or "general hospital"
        
        Return ONLY JSON:
        {"scene_type": "...", "scene_confidence": 0.0, "scene_description": "...", "labels": [], "text_detected": "..."}
        """
        result = _client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt,
            ],
        )
        raw = result.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(raw)
        
        return {
            "labels":            [l.lower() for l in data.get("labels", [])],
            "text_detected":     data.get("text_detected", ""),
            "scene_type":        data.get("scene_type", "unknown"),
            "scene_confidence":  float(data.get("scene_confidence", 0.5)),
            "scene_description": data.get("scene_description", ""),
            "scene_score":       None,
            "scene_reason":      None,
        }
    except Exception as e:
        print(f"  [SCENE] Gemini {model} failed: {e}")
        raise e


def score_scene_vs_category(scene_result: dict, category: str) -> tuple[float, str]:
    """
    Given scene analysis result and declared category, compute scene match score.

    Returns: (score: float, reason: str)
    """
    if not category:
        return 0.5, "No category declared — cannot verify scene match"

    scene_type  = scene_result.get("scene_type", "unknown")
    labels      = scene_result.get("labels", [])
    scene_conf  = scene_result.get("scene_confidence", 0.5)
    category    = category.lower()

    valid_scenes = CATEGORY_SCENE_MAP.get(category, [category])

    # Exact scene_type match
    if scene_type in valid_scenes:
        score = min(1.0, scene_conf + 0.1)
        return round(score, 2), f"Scene '{scene_type}' matches category '{category}'"

    # Partial: check if any label matches
    label_overlap = [l for l in labels if any(v in l for v in valid_scenes)]
    if label_overlap:
        return 0.65, f"Labels {label_overlap} partially match category '{category}'"

    # Generic building — weak match
    if scene_type in ["building", "outdoor", "street"]:
        return 0.35, f"Generic scene '{scene_type}' — cannot confirm '{category}'"

    # AI Fallback / Unknown
    if scene_type == "unknown":
        return 0.4, "Scene type unknown (AI Offline) - cannot confirm or deny match"

    # Clear mismatch
    return 0.1, f"Scene '{scene_type}' does NOT match category '{category}'"


def _download(url: str) -> bytes | None:
    """Download image bytes from URL, with support for search-engine redirects."""
    try:
        from urllib.parse import urlparse, parse_qs
        # Handle search-engine redirect URLs (Yahoo/Google)
        if "imgurl=" in url:
            parsed = urlparse(url)
            qs = parse_qs(parsed.query)
            if "imgurl" in qs:
                url = qs["imgurl"][0]
        
        r = requests.get(url, timeout=12, headers={
            "User-Agent": "Mozilla/5.0 (compatible; SmartMap/1.0)"
        })
        r.raise_for_status()
        return r.content
    except Exception as e:
        print(f"  [SCENE] Download failed: {e}")
        return None


def _simulate_analysis(image_url: str, location_name: str = "") -> dict:
    """Refined heuristic: prioritizes Location Name and avoids common URL false positives."""
    import re
    url = (image_url or "").lower()
    name = (location_name or "").lower()
    
    # 1. First, check the name provided by the user (Highest Trust)
    # 2. Then check the URL path (Medium Trust)
    # 3. Ignore query parameters if possible to avoid 'mcafee/cafe' or analytics tokens
    
    scene_type = "unknown"
    
    # Define regex categories (\b ensures whole word match)
    patterns = {
        "clinic":      r"\b(clinic|hospital|medical|health|doctor|physician|pharmacy|sick|dispensary)\b",
        "restaurant":  r"\b(restaurant|bakery|kitchen|dining|cafe|brunch|pizza|burger|sushi)\b",
        "game_zone":   r"\b(game|arcade|play|entertainment|gaming|sony|ps5|xbox)\b",
        "outdoor":     r"\b(park|nature|forest|outdoor|landscape|tree|mountain|beach)\b",
        "office":      r"\b(office|work|corporate|building|workspace|headquarters)\b",
    }
    
    # STRATEGY: Check Name first. If "medicine clinic" is the name, it MUST be a clinic.
    for s_type, pattern in patterns.items():
        if re.search(pattern, name):
            scene_type = s_type
            break
            
    # If name was generic (e.g. "Bole"), check URL
    if scene_type == "unknown":
        # Remove query params from URL to avoid tracking tokens like 'fr=mcafee'
        url_clean = url.split("?")[0]
        for s_type, pattern in patterns.items():
            if re.search(pattern, url_clean):
                scene_type = s_type
                break

    if scene_type != "unknown":
        desc = f"Smart Heuristic: Identified '{scene_type}' from Location Name/URL [DEMO MODE]"
        conf = 0.90 
    else:
        desc = "Simulated — AI Offline"
        conf = 0.45

    return {
        "labels": [scene_type] if scene_type != "unknown" else ["building"],
        "text_detected": "", "scene_type": scene_type,
        "scene_confidence": conf, "scene_description": desc,
        "scene_score": None, "scene_reason": None
    }
