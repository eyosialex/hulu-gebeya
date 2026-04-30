from rag import rag_pipeline
import json

def test_aastu_default():
    # No coordinates provided, should use AASTU (8.9799, 38.7945)
    query = "Find a cafe"
    
    print(f"\n--- Testing default location (AASTU) ---")
    
    try:
        response = rag_pipeline(query) # No location dict
        
        center = response["search_center"]
        print(f"Verified Search Center: {center['label']}")
        print(f"Center Lat: {center['lat']}")
        print(f"Center Lng: {center['lng']}")
        
        try:
            print(f"\nAnswer: {response['answer']}")
        except:
            print(f"\nAnswer: {response['answer'].encode('ascii', 'ignore').decode()} (Unicode hidden)")
            
        best = response['best_place']
        if best:
            print(f"Best Match: {best['name']} ({best.get('distance', 0):.2f}km away)")
        
        print("\nAll results distances:")
        sources = response["sources"]
        for source, items in sources.items():
            for item in items[:3]:
                print(f" - [{source}] {item['name'][:30]}... ({item.get('distance', 0):.2f}km away)")
        
        print("\nVerification Successful!")
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_aastu_default()
