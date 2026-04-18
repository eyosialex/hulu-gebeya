"""
test_full_verification.py
=========================
Tests the complete 4-layer image verification pipeline.

Run with:
    python test_full_verification.py

Tests 3 scenarios:
  1. Real photo + matching sign + matching category  -> high confidence
  2. Real photo + mismatched category               -> low confidence
  3. Image with no text, wrong category             -> rejected
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from image_verification.image_verifier import verify_location_image

BAR_WIDTH = 22


def render_bar(score: float) -> str:
    filled = int(score * BAR_WIDTH)
    empty  = BAR_WIDTH - filled
    return "[" + "#" * filled + "-" * empty + "]"


def print_result(label: str, result: dict):
    conf    = result["image_confidence"]
    verdict = result["verdict"]
    layers  = result["layers"]

    verdict_icons = {"Verified": "PASS", "Warning": "WARN", "Rejected": "FAIL"}
    icon = verdict_icons.get(verdict, "----")

    print("\n" + "=" * 65)
    print(f"  {label}")
    print("=" * 65)
    print(f"  [{icon}]  {verdict.upper()}")
    print(f"  Image Confidence : {conf * 100:.1f}%  {render_bar(conf)}")
    print()
    print(f"  Layer Breakdown:")
    layer_labels = {
        "real_photo": "L1 Real Photo",
        "ocr":        "L2 OCR / Signs",
        "scene":      "L3 Scene Match",
        "name_match": "L4 Name Match ",
    }
    for key, lbl in layer_labels.items():
        sc  = layers[key]["score"]
        rsn = layers[key]["reason"]
        # truncate long reasons
        rsn = rsn if len(rsn) <= 50 else rsn[:47] + "..."
        print(f"    {lbl}  {sc:.2f}  {render_bar(sc)}")
        print(f"               -> {rsn}")
    print()
    print(f"  Summary: {result['summary']}")

    # Layer 2 details
    ocr = layers["ocr"]
    if ocr.get("business_name") or ocr.get("amharic_text"):
        print(f"\n  OCR Details:")
        if ocr["business_name"]:
            print(f"    Business sign : '{ocr['business_name']}'")
        if ocr["other_signs"]:
            print(f"    Other signs   : {ocr['other_signs']}")
        if ocr["amharic_text"]:
            print(f"    Amharic text  : {ocr['amharic_text']}")
        print(f"    Language      : {ocr['language']}")

    # Layer 3 details
    scene = layers["scene"]
    print(f"\n  Scene Details:")
    print(f"    Type        : {scene['scene_type']}")
    print(f"    Description : {scene['description']}")
    print(f"    Labels      : {scene.get('labels', [])[:5]}")

    print("=" * 65)


# ══════════════════════════════════════════════════════════════════════════════
#  Test Cases
# ══════════════════════════════════════════════════════════════════════════════

test_cases = [
    {
        "label":         "TEST 1 - Real photo, should be high confidence",
        "image_url":     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640",
        "location_name": "Green Forest Park",
        "category":      "outdoor",
    },
    {
        "label":         "TEST 2 - Building photo vs restaurant category",
        "image_url":     "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=640",
        "location_name": "City View Restaurant",
        "category":      "food",
    },
    {
        "label":         "TEST 3 - Market photo, category shop",
        "image_url":     "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=640",
        "location_name": "Bole Market",
        "category":      "shop",
    },
]

print("\n" + "#" * 65)
print("  SmartMap — 4-Layer Image Verification Test Suite")
print("#" * 65)

for case in test_cases:
    result = verify_location_image(
        image_url     = case["image_url"],
        location_name = case["location_name"],
        category      = case["category"],
    )
    print_result(case["label"], result)

print("\nAll tests complete.\n")
