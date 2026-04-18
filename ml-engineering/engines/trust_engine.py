import math
from engines.verification.image_verifier import verify_location_image, get_image_confidence
from engines.geo_detection.detector import check_geo_validity
from data.data import locations

def calculate_trust_score(location_data):
    """
    Calculates a Trust Score with advanced logic:
    - User Reputation (30%) + Penalty for low scores
    - Crowd Agreement (30%) with diminishing returns scaling
    - Image Confidence (20%)
    - Geo Validity (20%)
    """
    # 1. User Trust Model (Penalty Logic)
    reputation = location_data.get("contributor_reputation", 0.5)
    # Penalty: If reputation is below 0.3, it significantly drags down the trust
    reputation_multiplier = 1.0 if reputation >= 0.3 else (reputation / 0.3)
    user_score = reputation * reputation_multiplier

    # 2. Crowd Consensus Model (Scaling Logic)
    # Using logarithmic scaling to simulate diminishing returns
    confirmations = location_data.get("confirmations", 0)
    if confirmations == 0:
        crowd_score = 0.0
    else:
        # Scale: 1 conf -> 0.4, 3 confs -> 0.8, 10 confs -> 1.0
        crowd_score = min(1.0, 0.4 * math.log(confirmations + 1, 2))
    
    # 3. Image Verification Model
    image_url = location_data.get("image_url")
    category = location_data.get("category")
    image_confidence = get_image_confidence(image_url, category=category)
    
    # 4. Geo-Consistency Model
    lat = location_data.get("lat")
    lng = location_data.get("lng")
    geo_validity = check_geo_validity(lat, lng) if (lat and lng) else 0.0
    
    # Calculate Final Score using weights
    trust_score = (user_score * 0.3) + \
                  (crowd_score * 0.3) + \
                  (image_confidence * 0.2) + \
                  (geo_validity * 0.2)
    
    trust_score = round(trust_score, 2)
    
    return {
        "trust_score": trust_score,
        "breakdown": {
            "user_reputation": round(user_score, 2),
            "crowd_consensus": round(crowd_score, 2),
            "image_confidence": round(image_confidence, 2),
            "geo_consistency": round(geo_validity, 2)
        },
        "status": get_realism_status(trust_score)
    }

def get_realism_status(score):
    """Categorizes the trust score into realism levels."""
    if score >= 0.8: return "Verified"
    if score >= 0.5: return "Warning"
    return "Fake / Suspicious"
