from utils import extract_category, clean_query
from osm_search import osm_search
from overpass import overpass_search
from rag import rag_pipeline
import json

def debug():
    query = "is there hotels in adis abeba"
    print(f"Query: {query}")
    
    category = extract_category(query)
    print(f"Extracted Category: {category}")
    
    subject = clean_query(query)
    print(f"Cleaned Subject: {subject}")
    
    print("\n--- Testing OSM ---")
    osm_results = osm_search(query)
    # Get results through rag_pipeline to see the 'start' field injected there
    pipeline_res = rag_pipeline(query)
    results = pipeline_res["sources"]["osm"]
    
    print(f"OSM Results: {len(results)}")
    for r in results[:2]:
        try:
            print(f" - {r['name']} (Start: {r.get('start')})")
        except:
            print(f" - {r['name'].encode('ascii', 'ignore').decode()} (Start: {r.get('start')})")
        
    print("\n--- Testing Overpass ---")
    overpass_results = overpass_search(query, category=category)
    print(f"Overpass Results: {len(overpass_results)}")
    for r in overpass_results[:5]:
        try:
            print(f" - {r['name']}")
        except:
            print(f" - {r['name'].encode('ascii', 'ignore').decode()} (Unicode hidden)")

if __name__ == "__main__":
    debug()
