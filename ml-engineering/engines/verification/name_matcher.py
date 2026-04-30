"""
name_matcher.py
===============
Layer 4: Location Name Matching.

Compares the submitted location name against text found in the image
by the OCR extractor (Layer 2).

Supports both English (Latin) and Amharic (Ethiopic) Unicode text.

Algorithm:
  1. Normalize both strings (lowercase, strip punctuation)
  2. Run difflib fuzzy matching for similarity ratio
  3. Also check if individual key words appear in the text blob
  4. Handle Amharic script via Unicode normalization

Usage:
    from image_verification.name_matcher import match_name_to_image

    score = match_name_to_image("Galaxy Game Zone", ocr_result)
    # 0.0 - 1.0
"""

import re
import unicodedata
from difflib import SequenceMatcher


# ── Category keyword synonyms (expand matching for category names) ─────────────
CATEGORY_SYNONYMS = {
    "game":     ["game", "gaming", "arcade", "play", "entertainment", "game zone"],
    "food":     ["food", "restaurant", "cafe", "kitchen", "cuisine", "dining", "eat"],
    "clinic":   ["clinic", "hospital", "health", "medical", "pharmacy", "care"],
    "church":   ["church", "chapel", "cathedral", "ministry", "gospel", "prayer"],
    "hotel":    ["hotel", "lodge", "inn", "guesthouse", "accommodation", "resort"],
    "school":   ["school", "college", "academy", "institute", "university", "education"],
    "shop":     ["shop", "store", "market", "mall", "supermarket", "boutique"],
    "bank":     ["bank", "finance", "microfinance", "savings", "credit"],
    "gym":      ["gym", "fitness", "sport", "workout", "training"],
}


def match_name(
    location_name: str,
    ocr_result: dict,
    category: str = None,
) -> dict:
    """
    Matches a location name and category against OCR-extracted image text.

    Args:
        location_name : The submitted location name (e.g., "Galaxy Game Zone")
        ocr_result    : Output from ocr_extractor.extract_text_from_image()
        category      : Optional category hint (e.g., "game", "clinic")

    Returns:
        {
            "name_match_score"    : float (0.0 - 1.0),
            "best_similarity"     : float (0.0 - 1.0),
            "matched_text"        : str  (which text it matched against),
            "keyword_found"       : bool,
            "category_keyword_found": bool,
            "name_match_reason"   : str,
        }
    """
    if not location_name:
        return _no_match("No location name provided")

    if not ocr_result or not ocr_result.get("all_text_combined"):
        return _no_match("No text extracted from image")

    # ── Normalize location name ────────────────────────────────────────────────
    norm_name = _normalize(location_name)
    name_words = [w for w in norm_name.split() if len(w) > 2]

    # ── Collect all candidate texts from OCR ──────────────────────────────────
    candidates = []
    if ocr_result.get("business_name"):
        candidates.append(ocr_result["business_name"])
    candidates += ocr_result.get("other_signs", [])
    candidates += ocr_result.get("amharic_text", [])
    all_text = ocr_result.get("all_text_combined", "")

    if not candidates and not all_text:
        return _no_match("Image has no text to compare against")

    # ── Fuzzy similarity against each candidate ────────────────────────────────
    best_ratio = 0.0
    best_match = ""
    for candidate in candidates:
        norm_cand = _normalize(candidate)
        ratio = SequenceMatcher(None, norm_name, norm_cand).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = candidate

    # Also compare against the full combined text blob as a fallback
    all_ratio = SequenceMatcher(None, norm_name, _normalize(all_text)).ratio()
    if all_ratio > best_ratio:
        best_ratio = all_ratio
        best_match = "(combined text)"

    # ── Keyword matching (individual words from location name) ────────────────
    keyword_found = False
    if name_words:
        keyword_found = any(word in all_text.lower() for word in name_words)

    # ── Category keyword check ────────────────────────────────────────────────
    category_keyword_found = False
    if category:
        synonyms = CATEGORY_SYNONYMS.get(category.lower(), [category.lower()])
        category_keyword_found = any(syn in all_text.lower() for syn in synonyms)

    # ── Final score ───────────────────────────────────────────────────────────
    score, reason = _compute_score(
        best_ratio,
        keyword_found,
        category_keyword_found,
        best_match,
        location_name,
    )

    return {
        "name_match_score":       round(score, 2),
        "best_similarity":        round(best_ratio, 2),
        "matched_text":           best_match,
        "keyword_found":          keyword_found,
        "category_keyword_found": category_keyword_found,
        "name_match_reason":      reason,
    }


def _compute_score(
    similarity: float,
    keyword_found: bool,
    category_kw_found: bool,
    matched_text: str,
    original_name: str,
) -> tuple[float, str]:
    """Map similarity + keyword signals into a 0–1 score."""
    if similarity >= 0.90:
        return 1.0, f"Exact name match: '{matched_text}' == '{original_name}'"
    elif similarity >= 0.75:
        return 0.85, f"Strong name match ({int(similarity*100)}%): '{matched_text}'"
    elif similarity >= 0.50:
        return 0.65, f"Partial name match ({int(similarity*100)}%): '{matched_text}'"
    elif keyword_found:
        return 0.55, f"Key words from name found in image text"
    elif category_kw_found:
        return 0.35, f"Category keywords found but name not matched"
    else:
        return 0.15, f"Name not found in image (similarity={int(similarity*100)}%)"


def _normalize(text: str) -> str:
    """
    Normalize text for comparison:
    - Unicode NFC normalization (handles Amharic correctly)
    - Lowercase
    - Remove punctuation
    - Collapse whitespace
    """
    if not text:
        return ""
    # NFC normalization preserves Amharic characters correctly
    text = unicodedata.normalize("NFC", text)
    text = text.lower()
    # Remove punctuation but keep letters (including Ethiopic Unicode range)
    text = re.sub(r"[^\w\s\u1200-\u137F]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _no_match(reason: str) -> dict:
    """Return a neutral no-match result."""
    return {
        "name_match_score":       0.4,
        "best_similarity":        0.0,
        "matched_text":           "",
        "keyword_found":          False,
        "category_keyword_found": False,
        "name_match_reason":      reason,
    }
