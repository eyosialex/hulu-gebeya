"""Test the upgraded RAG pipeline with 10 improvements."""
import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from engines.rag import rag_pipeline, extract_intent

print("\n" + "="*60)
print("  SmartMap RAG — Upgrade Test Suite (10 Improvements)")
print("="*60)

# --- Test 1: Intent Extraction (UPG 1)
print("\n--- UPG 1: Intent Extraction ---")
queries = [
    "find a verified cafe near bole",
    "quiet place good for studying with wifi",
    "best rated church near piassa",
    "cheap food near kazanchis",
]
for q in queries:
    intent = extract_intent(q)
    print(f"  Query   : {q}")
    print(f"  Category: {intent['category']}")
    print(f"  Filters : {intent['filters']}")
    print(f"  Location: {intent['location_hint']}")
    print(f"  Keywords: {intent['keywords']}")
    print()

# --- Test 2: Full RAG Pipeline (fast mode)
print("--- Full RAG Pipeline (fast_mode=True) ---")
result = rag_pipeline(
    query="verified restaurant near bole",
    location={"lat": 9.01, "lng": 38.76},
    fast_mode=True,
    user_preferences=["food", "game"]  # Simulate user history (UPG 9)
)

print(f"  Query      : {result['query']}")
print(f"  Confidence : {result['confidence']}  (NEW - UPG 10)")
print(f"  Intent     : {result['intent']}")
print(f"  Answer     : {result['answer']}")
print(f"  Total Found: {result['total_results']}")

if result['best_place']:
    b = result['best_place']
    print(f"\n  Best Match:")
    print(f"    Name     : {b.get('name')}")
    print(f"    Distance : {b.get('distance', 'N/A'):.2f}km")
    print(f"    Trust    : {b.get('trust_score', 'N/A')}")
    print(f"    Relevance: {b.get('relevance', 'N/A')}")

# --- Test 3: Filter-specific search (UPG 1 + 7)
print("\n--- Verified + High-Rated Filter ---")
r2 = rag_pipeline(
    query="best verified gym in addis",
    location={"lat": 9.02, "lng": 38.75},
    fast_mode=True,
)
print(f"  Confidence : {r2['confidence']}")
print(f"  Filters    : {r2['intent']['filters']}")
print(f"  Answer     : {r2['answer']}")
print(f"  Total Found: {r2['total_results']}")

print("\n" + "="*60)
print("  All tests complete!")
print("="*60 + "\n")
