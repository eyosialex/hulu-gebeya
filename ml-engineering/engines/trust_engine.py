"""
trust_engine.py  — SmartMap Upgraded Trust Engine
===================================================
Implements 6 high-impact scoring improvements:

  MOD 1: Dynamic Weight Adjustment       — Weights shift based on confirmation count
  MOD 2: Confirmation Quality            — Weighted by individual user reputation
  MOD 3: Time-Based Trust Decay          — Old data loses trust gradually
  MOD 4: Geo Intelligence Upgrade        — District-aware scoring (Bole, Piassa, etc.)
  MOD 5: Category Risk Factor            — High-risk categories (bank, gov) penalized harder
  MOD 6: Multi-Image Boost               — Multiple photos increase confidence

Final Formula:
  final_score = (rep * rep_weight) + (weighted_conf * crowd_weight)
              + (image_conf * image_weight) + (geo * geo_weight)
  final_score *= time_decay
  final_score += image_bonus - risk_penalty
"""

import math
from datetime import datetime, timezone
from engines.verification.image_verifier import get_image_confidence
from engines.geo_detection.detector import check_geo_validity
# Mock data import removed — now uses live database only


# ── MOD 5: Category Risk Penalties ────────────────────────────────────────────
# High-stakes categories are easier to fake maliciously — apply a stricter penalty
CATEGORY_RISK_PENALTY = {
    "bank":               0.20,
    "government_office":  0.25,
    "hospital":           0.18,
    "clinic":             0.15,
    "school":             0.12,
    "hotel":              0.10,
    "church":             0.05,
    "gym":                0.08,
    "shop":               0.06,
    "food":               0.05,
    "game":               0.08,
    "office":             0.10,
}

# ── MOD 3 IMPROVED: Category-Aware Time Decay ─────────────────────────────────
# Different categories have different expected lifespans.
# Landmarks barely decay; pop-up events decay fast.
#
#   decay_rate = days to lose half trust from max
#   floor      = minimum decay multiplier (never trust less than this)
CATEGORY_DECAY_PROFILE = {
    # Permanent landmarks — very slow decay
    "church":             {"rate": 3650, "floor": 0.85},  # ~10yr half-life
    "mosque":             {"rate": 3650, "floor": 0.85},
    "school":             {"rate": 1825, "floor": 0.80},  # ~5yr half-life
    "hospital":           {"rate": 1825, "floor": 0.80},
    "government_office":  {"rate": 1825, "floor": 0.75},
    # Stable businesses — medium decay
    "bank":               {"rate": 730,  "floor": 0.65},  # ~2yr half-life
    "hotel":              {"rate": 730,  "floor": 0.65},
    "gym":                {"rate": 548,  "floor": 0.60},  # ~18mo half-life
    "clinic":             {"rate": 548,  "floor": 0.60},
    "office":             {"rate": 365,  "floor": 0.55},
    # Dynamic businesses — faster decay
    "shop":               {"rate": 365,  "floor": 0.50},  # ~1yr half-life
    "food":               {"rate": 270,  "floor": 0.45},
    "game":               {"rate": 270,  "floor": 0.45},
    # Default for unknown
    "_default":           {"rate": 365,  "floor": 0.50},
}

# ── MOD 4: Addis Ababa High-Density Business Districts ────────────────────────
# Areas with known high commercial density → big geo boost
ADDIS_BUSINESS_ZONES = [
    {"name": "Bole",     "lat_min": 8.98, "lat_max": 9.04, "lng_min": 38.73, "lng_max": 38.80},
    {"name": "Piassa",   "lat_min": 9.01, "lat_max": 9.04, "lng_min": 38.73, "lng_max": 38.76},
    {"name": "Merkato",  "lat_min": 9.01, "lat_max": 9.04, "lng_min": 38.72, "lng_max": 38.75},
    {"name": "Kazanchis","lat_min": 9.00, "lat_max": 9.03, "lng_min": 38.74, "lng_max": 38.77},
    {"name": "CMC",      "lat_min": 9.03, "lat_max": 9.08, "lng_min": 38.78, "lng_max": 38.84},
]

ADDIS_CITY_BOUNDS = {
    "lat_min": 8.85, "lat_max": 9.20,
    "lng_min": 38.60, "lng_max": 38.95,
}


def calculate_trust_score(location_data: dict) -> dict:
    """
    Master trust scoring function.

    location_data expected keys:
      - contributor_reputation: float (0–1)
      - confirmations: int OR list of {reputation: float} dicts
      - image_url: str
      - image_urls: list[str]       # MOD 6 — optional multiple images
      - category: str
      - lat: float
      - lng: float
      - created_at: str (ISO 8601) # MOD 3 — optional, for decay
    """
    confirmations_raw  = location_data.get("confirmations", 0)
    reputation         = location_data.get("contributor_reputation", 0.5)
    image_url          = location_data.get("image_url")
    image_urls         = location_data.get("image_urls", [])
    category           = (location_data.get("category") or "").lower()
    lat                = location_data.get("lat")
    lng                = location_data.get("lng")
    created_at_str     = location_data.get("created_at")
    location_name      = location_data.get("name", "")

    # ── MOD 2: Confirmation Quality ────────────────────────────────────────────
    # Accept either a plain int or a list of confirmer dicts {reputation: float}
    if isinstance(confirmations_raw, list) and len(confirmations_raw) > 0:
        confirmer_reps = [c.get("reputation", 0.5) for c in confirmations_raw]
        num_confirmations = len(confirmer_reps)
        avg_confirmer_rep = sum(confirmer_reps) / num_confirmations
    else:
        num_confirmations = int(confirmations_raw)
        avg_confirmer_rep = 0.6  # Assume average user if rep data unavailable

    # ── MOD 1: Dynamic Weights ────────────────────────────────────────────────
    # Shift trust toward image for new submissions, crowd for popular ones
    if num_confirmations == 0:
        image_weight = 0.40   # No crowd yet → lean hard on image
        crowd_weight = 0.10
        rep_weight   = 0.30
        geo_weight   = 0.20
    elif num_confirmations < 3:
        image_weight = 0.30
        crowd_weight = 0.20
        rep_weight   = 0.30
        geo_weight   = 0.20
    elif num_confirmations <= 5:
        image_weight = 0.20
        crowd_weight = 0.30
        rep_weight   = 0.30
        geo_weight   = 0.20
    else:
        image_weight = 0.10   # Popular location → trust crowd heavily
        crowd_weight = 0.45
        rep_weight   = 0.25
        geo_weight   = 0.20

    # ── 1. User Reputation Score ───────────────────────────────────────────────
    reputation_multiplier = 1.0 if reputation >= 0.3 else (reputation / 0.3)
    user_score = reputation * reputation_multiplier

    # ── 2. Crowd Score (MOD 2: weighted by confirmer quality) ─────────────────
    if num_confirmations == 0:
        crowd_score = 0.0
        weighted_crowd = 0.0
    else:
        # Logarithmic scale: 1→0.4, 3→0.8, 10→1.0
        log_crowd = min(1.0, 0.4 * math.log(num_confirmations + 1, 2))
        # Multiply by average confirmer reputation — bots get penalized here
        weighted_crowd = min(1.0, log_crowd * avg_confirmer_rep * 1.5)
        crowd_score = weighted_crowd

    # ── 3. Image Confidence ────────────────────────────────────────────────────
    image_scores = []
    if image_url:
        score = get_image_confidence(image_url, category=category, location_name=location_name)
        image_scores.append(score)

    # MOD 6: Multiple images
    for url in image_urls:
        if url and url != image_url:
            s = get_image_confidence(url, category=category, location_name=location_name)
            image_scores.append(s)

    image_confidence = sum(image_scores) / len(image_scores) if image_scores else 0.0

    # MOD 6: Image bonus for multiple photos
    num_images = len(image_scores)
    image_bonus = min(0.10, num_images * 0.02) if num_images > 1 else 0.0

    # ── 4. Geo Score (MOD 4: district-aware) ──────────────────────────────────
    geo_validity = _smart_geo_score(lat, lng) if (lat and lng) else 0.0

    # ── Final Base Score ───────────────────────────────────────────────────────
    trust_score = (
        user_score       * rep_weight   +
        crowd_score      * crowd_weight +
        image_confidence * image_weight +
        geo_validity     * geo_weight
    )

    # ── MOD 3: Time-Based Decay ────────────────────────────────────────────────
    time_decay = _calculate_time_decay(created_at_str, category=category)
    trust_score *= time_decay

    # ── MOD 6: Multi-Image Bonus ───────────────────────────────────────────────
    trust_score += image_bonus

    # ── MOD 5: Category Risk Penalty ──────────────────────────────────────────
    risk_penalty = CATEGORY_RISK_PENALTY.get(category, 0.10)
    trust_score -= risk_penalty

    trust_score = round(max(0.0, min(1.0, trust_score)), 3)

    return {
        "trust_score": trust_score,
        "status":      get_realism_status(trust_score),
        "breakdown": {
            "user_reputation":    round(user_score, 3),
            "crowd_consensus":    round(crowd_score, 3),
            "image_confidence":   round(image_confidence, 3),
            "geo_consistency":    round(geo_validity, 3),
            "time_decay":         round(time_decay, 3),
            "image_bonus":        round(image_bonus, 3),
            "risk_penalty":       round(risk_penalty, 3),
            "num_confirmations":  num_confirmations,
            "avg_confirmer_rep":  round(avg_confirmer_rep, 3),
            "num_images":         num_images,
        },
        "weights_used": {
            "rep_weight":   rep_weight,
            "crowd_weight": crowd_weight,
            "image_weight": image_weight,
            "geo_weight":   geo_weight,
        },
    }


# ── MOD 3: Category-Aware Time Decay ──────────────────────────────────────────

def _calculate_time_decay(created_at_str: str | None, category: str = "") -> float:
    """
    Category-aware decay — different entities age differently:

      🏛️  Landmarks (church, school, hospital) → slow decay, high floor (0.80–0.95)
      🏪  Stable businesses (bank, hotel, gym)  → medium decay, mid floor (0.60–0.70)
      🍔  Dynamic businesses (shop, food, game) → faster decay, lower floor (0.45–0.55)

    Formula:
      decay = 1.0 - (days_old / rate)
      decay = max(floor, decay)
    """
    if not created_at_str:
        return 0.88  # Unknown age — mild penalty

    profile = CATEGORY_DECAY_PROFILE.get(category.lower(),
              CATEGORY_DECAY_PROFILE["_default"])
    rate  = profile["rate"]
    floor = profile["floor"]

    try:
        created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days_old = (now - created_at).days

        if days_old <= 30:
            return 1.0  # Fresh — no decay

        decay = max(floor, 1.0 - (days_old / rate))
        return round(decay, 3)
    except Exception:
        return 0.88


# ── MOD 4: Smart Geo Score ────────────────────────────────────────────────────

def _smart_geo_score(lat: float, lng: float) -> float:
    """
    Upgrade from binary 1.0/0.1 to a 4-tier system:
      - In a known Addis Ababa business district → 1.0
      - Inside Addis city bounds                 → 0.7
      - Near Addis but outside city              → 0.3
      - Far off (not Ethiopia)                   → 0.05
    """
    # Tier 1: Known business district
    for zone in ADDIS_BUSINESS_ZONES:
        if (zone["lat_min"] <= lat <= zone["lat_max"] and
                zone["lng_min"] <= lng <= zone["lng_max"]):
            return 1.0

    # Tier 2: Inside general Addis city limits
    b = ADDIS_CITY_BOUNDS
    if b["lat_min"] <= lat <= b["lat_max"] and b["lng_min"] <= lng <= b["lng_max"]:
        # Optionally confirm with Overpass for road/building proximity
        try:
            from engines.geo_detection.detector import check_geo_validity
            overpass_score = check_geo_validity(lat, lng)
            # Blend: city confirmed + overpass proximity
            return round(0.5 + overpass_score * 0.3, 2)
        except Exception:
            return 0.70

    # Tier 3: Ethiopia general region (but not Addis)
    if 3.0 <= lat <= 15.0 and 33.0 <= lng <= 48.0:
        return 0.30

    # Tier 4: Completely off the map
    return 0.05


# ── Verdict Categorization ─────────────────────────────────────────────────────

def get_realism_status(score: float) -> str:
    if score >= 0.80:
        return "✅ Verified"
    if score >= 0.55:
        return "⚠️ Warning"
    if score >= 0.35:
        return "🔶 Low Trust"
    return "❌ Fake / Suspicious"
