from overpass import overpass_search
import json

def test_failover():
    # Use Piassa center (denser area) to guarantee results if server is up
    lat, lng = 9.035, 38.752
    query = "Search for museums"
    category = {"osm_tag": '["tourism"~"museum|attraction"]', "label": "entertainment"}
    
    print(f"Testing Overpass Failover at Piassa ({lat}, {lng})")
    
    results = overpass_search(query, category=category, lat=lat, lng=lng)
    
    print(f"\nFinal Result: {len(results)} items found.")
    
    for r in results[:3]:
        print(f" - {r['name']} ({r.get('source')})")
        
    if results:
        print("\nVerification Successful! One of the servers responded.")
    else:
        print("\nVerification Failed. All servers seem to be down or returning empty.")

if __name__ == "__main__":
    test_failover()
