import requests
import json

url = "http://localhost:5001/rag"
payload = {
    "query": "clinic",
    "location": {"lat": 8.98, "lng": 38.75},
    "fast_mode": True
}

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
