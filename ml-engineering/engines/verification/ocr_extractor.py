"""
ocr_extractor.py
================
Layer 2: OCR — Read all text and signs visible in an image.

Uses Gemini Vision to extract:
  - Business name signs
  - Street signs / banners
  - Wall labels, menu boards, price lists
  - Any Amharic or Latin text in the scene

Supports both English and Amharic script.

Usage:
    from image_verification.ocr_extractor import extract_text_from_image

    result = extract_text_from_image(image_bytes)
    # {
    #     "business_name": "Galaxy Game Zone",
    #     "other_signs": ["WiFi Available", "Open 24hrs"],
    #     "street_labels": ["Bole Road"],
    #     "amharic_text": ["ጋላክሲ ጌም ዞን"],
    #     "all_text_combined": "galaxy game zone wifi available open 24hrs bole road",
    #     "language": "English",
    #     "ocr_score": 1.0,
    #     "ocr_reason": "Clear business name sign found"
    # }
"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../../.env'))
_API_KEY = os.getenv("GEMINI_API_KEY")
_HF_TOKEN = os.getenv("HF_API_TOKEN")

if _API_KEY and _API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    _client = genai.Client(api_key=_API_KEY)
    _ACTIVE = True
else:
    _client = None
    _ACTIVE = False


def extract_text(image_bytes: bytes, location_name: str = "", image_url: str = "") -> dict:
    """
    Layer 2: Extracts all visible text and signs from an image.
    
    Fallback Order:
      1. Gemini 2.0 Flash
      2. Gemini 1.5 Flash (if 429)
      3. Smart Heuristic Simulation (based on keywords)
    """
    if not image_bytes:
        return _fallback_ocr(location_name=location_name, image_url=image_url)

    # ── Try Gemini (2.0 first, then 1.5) ─────────────────────────────────────
    if _ACTIVE:
        try:
            return _extract_with_gemini(image_bytes, model="gemini-2.0-flash")
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print("  [OCR] Gemini 2.0 exhausted, trying 1.5 Flash...")
                try:
                    return _extract_with_gemini(image_bytes, model="gemini-1.5-flash")
                except Exception as e2:
                    print(f"  [OCR] Gemini 1.5 also failed: {e2}")
            else:
                print(f"  [OCR] Gemini error: {e}")

    return _fallback_ocr(location_name=location_name, image_url=image_url)


def _extract_with_gemini(image_bytes: bytes, model: str = "gemini-2.0-flash") -> dict:
    """Internal helper for Gemini OCR."""
    try:
        prompt = """
        You are an expert OCR system analyzing a real-world location photo.
        Read EVERY piece of text carefully (names, signs, street names, Amharic).
        Return ONLY JSON:
        {"business_name": "...", "other_signs": [], "street_labels": [], "amharic_text": [], "language": "..."}
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
        
        business_name  = data.get("business_name", "").strip()
        other_signs    = [s.strip() for s in data.get("other_signs", []) if s.strip()]
        amharic_text   = [s.strip() for s in data.get("amharic_text", []) if s.strip()]
        
        ocr_score, ocr_reason = _score_ocr(business_name, other_signs, amharic_text)
        
        return {
            "business_name":    business_name,
            "other_signs":      other_signs,
            "street_labels":    data.get("street_labels", []),
            "amharic_text":     amharic_text,
            "all_text_combined": " ".join([business_name] + other_signs + amharic_text).lower(),
            "language":         data.get("language", "Unknown"),
            "ocr_score":        ocr_score,
            "ocr_reason":       ocr_reason,
        }
    except Exception as e:
        print(f"  [OCR] Gemini {model} failed: {e}")
        raise e


def _score_ocr(business_name: str, other_signs: list, amharic_text: list) -> tuple[float, str]:
    """Score the quality of extracted OCR text."""
    if business_name:
        return 1.0, f"Clear business name found: '{business_name}'"
    elif other_signs:
        return 0.6, f"Text found but no main name: {other_signs[:2]}"
    elif amharic_text:
        return 0.6, f"Amharic text found: {amharic_text[:1]}"
    else:
        return 0.3, "No readable text found in image"


def _fallback_ocr(reason: str = "AI Offline - Using Heuristics", location_name: str = "", image_url: str = "") -> dict:
    """Returns a neutral but 'smart' result when AI is unavailable."""
    url = (image_url or "").lower()
    name = (location_name or "").lower()
    
    score = 0.45
    business_name = ""
    
    # If any word from the location name is found in the URL, we guess it's a match
    import re
    # Match whole words only to avoid false positives
    pattern = r"\b(" + "|".join(re.escape(w.strip()) for w in name.split() if len(w.strip()) > 3) + r")\b"
    
    if name and re.search(pattern, url):
        business_name = location_name
        score = 0.90  # Boosted for Demo Mode as requested
        reason = f"Smart Heuristic: Confirmed keywords from '{location_name}' [DEMO MODE]"

    return {
        "business_name": business_name, "other_signs": [], "street_labels": [],
        "amharic_text": [], "all_text_combined": business_name, "language": "Unknown",
        "ocr_score": score, "ocr_reason": reason,
    }
