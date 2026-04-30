"""
Quick test for detect_real_photo()
Run with:  python test_detector.py
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from image_verification.real_photo_detector import detect_real_photo

# ── Test images ───────────────────────────────────────────────────────────────
test_cases = [
    {
        "label": "TEST 1 - Real outdoor photo (forest)",
        "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640",
    },
    {
        "label": "TEST 2 - Real building photo",
        "url": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=640",
    },
    {
        "label": "TEST 3 - Your custom URL (replace with any image)",
        "url": "https://picsum.photos/seed/hospital/640/480",
    },
]

# ── Run all tests ─────────────────────────────────────────────────────────────
for case in test_cases:
    print("\n" + "=" * 65)
    print(f"  {case['label']}")
    print(f"  URL: {case['url']}")
    print("=" * 65)

    result = detect_real_photo(case["url"])

    # Final verdict
    if result["is_real"] and result["confidence"] > 0.60:
        verdict = "VERIFIED - Real Photo"
        status  = "PASS"
    elif result["is_real"]:
        verdict = "LIKELY REAL - Low Confidence"
        status  = "WARN"
    else:
        verdict = "REJECTED - Possibly AI/Fake/Edited"
        status  = "FAIL"

    print(f"\n  [{status}] {verdict}")
    print(f"  Confidence : {result['confidence'] * 100:.1f}%")
    print(f"\n  Score Breakdown:")
    for key, val in result["score_breakdown"].items():
        bar   = "#" * int(val * 20)
        empty = "-" * (20 - int(val * 20))
        label = key.replace("_score", "").upper().ljust(8)
        print(f"    {label}  {val:.2f}  [{bar}{empty}] {int(val*100)}%")

    print(f"\n  Detailed Reasons:")
    for reason in result["reason"].split(" | "):
        print(f"    >> {reason}")
