import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_status():
    print("\n[TEST] Testing / status...")
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Status: {r.status_code}")
        print(r.json())
    except Exception as e:
        print(f"Error: {e}")

def test_query():
    print("\n[TEST] Testing /query?q=game...")
    try:
        r = requests.get(f"{BASE_URL}/query", params={"q": "game"})
        print(f"Status: {r.status_code}")
        results = r.json()
        print(f"Found {len(results)} results")
        if results:
            print(f"First result: {results[0]['name']} (Score: {results[0].get('trust_score')})")
    except Exception as e:
        print(f"Error: {e}")

def test_rag():
    print("\n[TEST] Testing /rag...")
    payload = {
        "query": "Is there a game zone near Bole?",
        "fast_mode": False
    }
    try:
        r = requests.post(f"{BASE_URL}/rag", json=payload)
        print(f"Status: {r.status_code}")
        res = r.json()
        print(f"Answer: {res.get('answer')}")
        print(f"Best Place: {res.get('best_place', {}).get('name')}")
    except Exception as e:
        print(f"Error: {e}")

def test_verify():
    print("\n[TEST] Testing /verify (Bole Game Zone)...")
    payload = {
        "location_id": "loc_001"
    }
    try:
        r = requests.post(f"{BASE_URL}/verify", json=payload)
        print(f"Status: {r.status_code}")
        res = r.json()
        print(f"Trust Score: {res.get('trust_score')}")
        print(f"Breakdown: {json.dumps(res.get('breakdown'), indent=2)}")
        print(f"Verdict: {res.get('status')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Note: Server must be running for these tests to work
    test_status()
    test_query()
    test_rag()
    test_verify()
