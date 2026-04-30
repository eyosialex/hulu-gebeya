import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from trust_engine import calculate_trust_score
from data import locations

print("--- SmartMap Trust System Verification ---")

for loc in locations:
    score = calculate_trust_score(loc)
    print(f"Location: {loc['name']:<20} | Score: {score:<5} | Confirmations: {loc['confirmations']}")

# Test edge cases
print("\n--- Edge Case Testing ---")

# 1. No image, no confirmations, low reputation
low_trust = {
    "name": "Suspicious Shop",
    "lat": 9.032,
    "lng": 38.745,
    "confirmations": 0,
    "contributor_reputation": 0.1,
    "image_url": None
}
print(f"Location: {low_trust['name']:<20} | Score: {calculate_trust_score(low_trust)}")

# 2. Out of bounds location
far_away = {
    "name": "Moon Base",
    "lat": 0.0,
    "lng": 0.0,
    "confirmations": 10,
    "contributor_reputation": 1.0,
    "image_url": "http://verified.jpg"
}
print(f"Location: {far_away['name']:<20} | Score: {calculate_trust_score(far_away)}")
