"""
test_trust_engine.py
====================
Quick sanity check for all 6 Trust Engine upgrades.

Run with:
    python tests/test_trust_engine.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from engines.trust_engine import calculate_trust_score, get_realism_status

BAR_WIDTH = 24

def bar(score):
    filled = int(score * BAR_WIDTH)
    return "[" + "█" * filled + "░" * (BAR_WIDTH - filled) + "]"

def print_result(label, result):
    ts  = result["trust_score"]
    st  = result["status"]
    bd  = result["breakdown"]
    wt  = result["weights_used"]
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"  STATUS : {st}")
    print(f"  SCORE  : {ts:.3f}  {bar(ts)}")
    print(f"\n  Breakdown:")
    print(f"    👤 Reputation      : {bd['user_reputation']:.3f}  (weight {wt['rep_weight']})")
    print(f"    👥 Crowd           : {bd['crowd_consensus']:.3f}  (weight {wt['crowd_weight']}, "
          f"{bd['num_confirmations']} confs, avg rep {bd['avg_confirmer_rep']:.2f})")
    print(f"    🖼️  Image           : {bd['image_confidence']:.3f}  (weight {wt['image_weight']}, {bd['num_images']} image(s))")
    print(f"    📍 Geo             : {bd['geo_consistency']:.3f}  (weight {wt['geo_weight']})")
    print(f"    ⏳ Time Decay      : ×{bd['time_decay']:.3f}")
    print(f"    🎁 Image Bonus     : +{bd['image_bonus']:.3f}")
    print(f"    ⚠️  Risk Penalty    : -{bd['risk_penalty']:.3f}")
    print(f"{'='*60}")

# ── Test Cases ────────────────────────────────────────────────────────────────

cases = [
    {
        "label": "TEST 1 — New real location, zero confirmations (image should dominate)",
        "data": {
            "name": "Bole Coffee Shop",
            "contributor_reputation": 0.85,
            "confirmations": 0,
            "image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=640",
            "category": "food",
            "lat": 9.01, "lng": 38.76,
            "created_at": "2025-12-01T00:00:00Z",
        }
    },
    {
        "label": "TEST 2 — Popular location with bot confirmations (should be penalized)",
        "data": {
            "name": "Sus Bank (Fake)",
            "contributor_reputation": 0.05,
            "confirmations": [
                {"reputation": 0.05}, {"reputation": 0.04},
                {"reputation": 0.06}, {"reputation": 0.05},
                {"reputation": 0.03}, {"reputation": 0.07},
                {"reputation": 0.05}, {"reputation": 0.06},
                {"reputation": 0.04}, {"reputation": 0.05},
            ],
            "image_url": "http://scam.ru/fake.jpg",
            "category": "bank",
            "lat": 8.95, "lng": 38.75,
            "created_at": "2020-01-01T00:00:00Z",
        }
    },
    {
        "label": "TEST 3 — Trusted location, 3 real users, 2 images, in Bole",
        "data": {
            "name": "St. George Church",
            "contributor_reputation": 0.92,
            "confirmations": [
                {"reputation": 0.90}, {"reputation": 0.88}, {"reputation": 0.95},
            ],
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/640px-Camponotus_flavomarginatus_ant.jpg",
            "image_urls": ["https://images.unsplash.com/photo-1563452619970-819a0e0fd25b?w=400"],
            "category": "church",
            "lat": 9.03, "lng": 38.74,
            "created_at": "2024-06-15T00:00:00Z",
        }
    },
]

print("\n" + "#" * 60)
print("  SmartMap — Upgraded Trust Engine Test Suite (6 Mods)")
print("#" * 60)

for case in cases:
    result = calculate_trust_score(case["data"])
    print_result(case["label"], result)

print("\nAll tests complete.\n")
