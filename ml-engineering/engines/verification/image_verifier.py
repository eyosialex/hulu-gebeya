"""
image_verifier.py  (Master Orchestrator)
=========================================
Runs all 4 verification layers on a location image and returns a single
`image_confidence` score that feeds into trust_engine.py.

Layer 1 (25%): Real Photo Check     — real_photo_detector.py
Layer 2 (25%): OCR / Text & Signs   — ocr_extractor.py
Layer 3 (25%): Scene Classification — analysis.py
Layer 4 (25%): Name Matching        — name_matcher.py

Usage:
    from image_verification.image_verifier import verify_location_image

    result = verify_location_image(
        image_url     = "https://example.com/photo.jpg",
        location_name = "Galaxy Game Zone",
        category      = "game",
    )

    # result["image_confidence"]  <- use this in trust_engine.py
    # result["layers"]            <- per-layer breakdown
    # result["summary"]           <- human-readable verdict
"""

import io
import sys

# ensure UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    except Exception:
        pass

from engines.verification.real_photo_detector import detect_real_photo, _download_image
from engines.verification.ocr_extractor import extract_text, _fallback_ocr
from engines.verification.analysis import classify_scene, _simulate_analysis, score_scene_vs_category
from engines.verification.name_matcher import match_name

# Layer weights
_WEIGHTS = {
    "real_photo": 0.25,
    "ocr":        0.25,
    "scene":      0.25,
    "name_match": 0.25,
}


def verify_location_image(
    image_url: str,
    location_name: str = "",
    category: str = "",
) -> dict:
    """
    Master verification function.

    Args:
        image_url     : Direct URL of the uploaded location image
        location_name : Submitted location name (e.g., "Galaxy Game Zone")
        category      : Declared category (e.g., "game", "clinic", "food")

    Returns:
        {
            "image_confidence": float,     # 0.0 - 1.0  → use in trust_engine
            "is_verified":      bool,      # True if confidence >= 0.60
            "verdict":          str,       # "Verified" | "Warning" | "Rejected"
            "summary":          str,       # Human-readable explanation
            "layers": {
                "real_photo": { "score": float, "reason": str, ... },
                "ocr":        { "score": float, "reason": str, ... },
                "scene":      { "score": float, "reason": str, ... },
                "name_match": { "score": float, "reason": str, ... },
            }
        }
    """
    print(f"\n[VERIFIER] Verifying: '{location_name}' | category='{category}'")
    print(f"[VERIFIER] Image: {image_url}")

    # Download image once — share bytes across all layers
    image_bytes, _ = _download_image(image_url)

    results = {}

    # ── Layer 1: Real Photo Check ──────────────────────────────────────────────
    print("[L1] Running real photo check...")
    real_result = detect_real_photo(image_url)
    results["real_photo"] = {
        "score":    real_result["confidence"],
        "is_real":  real_result["is_real"],
        "reason":   real_result["reason"].split(" | ")[0],   # first reason only
        "breakdown": real_result.get("score_breakdown", {}),
    }
    print(f"     -> score={results['real_photo']['score']:.2f}")

    # ── Layer 2: OCR — Text & Sign Extraction ──────────────────────────────────
    print("[L2] Running OCR text extraction...")
    ocr_result = extract_text(image_bytes or b"", location_name=location_name, image_url=image_url)
    results["ocr"] = {
        "score":         ocr_result["ocr_score"],
        "reason":        ocr_result["ocr_reason"],
        "business_name": ocr_result["business_name"],
        "other_signs":   ocr_result["other_signs"],
        "amharic_text":  ocr_result["amharic_text"],
        "language":      ocr_result["language"],
    }
    print(f"     -> score={results['ocr']['score']:.2f} | name='{ocr_result['business_name']}'")

    # ── Layer 3: Scene Classification ─────────────────────────────────────────
    print("[L3] Running scene classification...")
    scene_result = classify_scene(image_url=image_url, image_bytes=image_bytes, location_name=location_name)
    scene_score, scene_reason = score_scene_vs_category(scene_result, category)
    results["scene"] = {
        "score":       scene_score,
        "reason":      scene_reason,
        "scene_type":  scene_result["scene_type"],
        "description": scene_result["scene_description"],
        "confidence":  scene_result["scene_confidence"],
        "labels":      scene_result["labels"],
    }
    print(f"     -> score={scene_score:.2f} | scene='{scene_result['scene_type']}'")

    # ── Layer 4: Name Matching ─────────────────────────────────────────────────
    print("[L4] Running name matching...")
    name_result = match_name(location_name, ocr_result, category=category)
    results["name_match"] = {
        "score":       name_result["name_match_score"],
        "reason":      name_result["name_match_reason"],
        "similarity":  name_result["best_similarity"],
        "matched_text": name_result["matched_text"],
        "keyword_hit": name_result["keyword_found"],
    }
    print(f"     -> score={name_result['name_match_score']:.2f} | sim={name_result['best_similarity']:.2f}")

    # ── Final image_confidence ─────────────────────────────────────────────────
    image_confidence = (
        results["real_photo"]["score"] * _WEIGHTS["real_photo"] +
        results["ocr"]["score"]        * _WEIGHTS["ocr"]        +
        results["scene"]["score"]      * _WEIGHTS["scene"]       +
        results["name_match"]["score"] * _WEIGHTS["name_match"]
    )
    image_confidence = round(image_confidence, 3)

    # Verdict
    if image_confidence >= 0.75:
        verdict = "Verified"
    elif image_confidence >= 0.50:
        verdict = "Uncertain"
    else:
        verdict = "Fake"

    is_verified = image_confidence >= 0.70 # Strict threshold for boolean verified

    # Build human-readable summary
    summary = _build_summary(
        location_name, category, image_confidence, verdict, results
    )

    # Detect if any layer failed due to quota
    all_reasons = (results["ocr"]["reason"] + results["scene"]["reason"]).lower()
    if "429" in all_reasons or "quota" in all_reasons or "resource_exhausted" in all_reasons:
        summary = f"[QUOTA LIMIT] {summary}"

    print(f"[VERIFIER] Final image_confidence={image_confidence:.3f} | verdict={verdict}")

    return {
        "image_confidence": image_confidence,
        "is_verified":      is_verified,
        "verdict":          verdict,
        "summary":          summary,
        "layers":           results,
    }


# ── Legacy compatibility wrapper ───────────────────────────────────────────────

def get_image_confidence(image_url: str, category: str = None, location_name: str = "") -> float:
    """
    Drop-in replacement for the old verifier.get_image_confidence().
    Called by trust_engine.py.
    """
    result = verify_location_image(image_url, location_name, category or "")
    return result["image_confidence"]


# ── Helper ─────────────────────────────────────────────────────────────────────

def _build_summary(name, category, confidence, verdict, layers) -> str:
    parts = []
    
    # Final level icons
    level_icon = "✅" if verdict == "Verified" else "⚠️" if verdict == "Uncertain" else "❌"
    
    if verdict == "Verified":
        parts.append(f"[{level_icon}] Image Verified: '{name}' meets production-ready standards.")
    elif verdict == "Uncertain":
        parts.append(f"[{level_icon}] Image Uncertain: '{name}' has suspicious elements.")
    else:
        parts.append(f"[{level_icon}] Image Rejected: '{name}' is likely a Fake/Stock photo.")

    r = layers["real_photo"]
    parts.append(f"Authenticity: {int(r['score']*100)}%.")

    o = layers["ocr"]
    if o["business_name"]:
        parts.append(f"Sign detected: '{o['business_name']}'.")
    else:
        parts.append("No business sign found.")

    s = layers["scene"]
    parts.append(f"Scene: {s['scene_type']}.")

    parts.append(f"System Confidence: {int(confidence*100)}%.")
    return " ".join(parts)
