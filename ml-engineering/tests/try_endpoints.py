import requests
import json

BASE_URL = "http://localhost:5000"

def try_endpoint(name, method, endpoint, params=None, json_data=None):
    print(f"\n--- {name} ({method} {endpoint}) ---")
    try:
        if method == "GET":
            r = requests.get(f"{BASE_URL}{endpoint}", params=params)
        else:
            r = requests.post(f"{BASE_URL}{endpoint}", json=json_data)
        
        print(f"Status: {r.status_code}")
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # 1. Test Query (Find Game Zones)
    try_endpoint("Search Query", "GET", "/query", params={"q": "game zone"})

    # 2. Test Verification (Bole Game Zone)
    try_endpoint("Full Verification", "POST", "/verify", json_data={"location_id": "loc_001"})

    # 3. Test RAG (Intelligent Question)
    try_endpoint("RAG Search", "POST", "/rag", json_data={
        "query": "Is there a clinic near Bole?", 
        "fast_mode": False
    })

    # 4. Test Game Engine (Next Mission)
    try_endpoint("Game Engine", "GET", "/mission/next", params={"lat": 9.032, "lng": 38.742})
