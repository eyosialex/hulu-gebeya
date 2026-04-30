"""
main.py — SmartMap Unified Full-Service Backend
===============================================
This is the consolidated entry point for all ML-Engineering services:
- Smart Search & RAG (AI Powered)
- Image Verification (4-Layer AI Engine)
- Robot Missions & Persona (Gemini Dialogue)
- Map Validation Quizzes (Crowdsourcing)
- Live Navigation Guidance
"""

import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests

# ── Dynamic Modules Integration ──────────────────────────────────────────────
from engines.verification.image_verifier import verify_location_image
from engines.trust_engine import calculate_trust_score, get_realism_status
from engines.rag import rag_pipeline
from game.mission_engine import (
    get_next_mission, 
    get_live_directions, 
    get_gemini_persona_chat, 
    generate_quiz,
    submit_quiz_answer
)
# Mock locations removed to prioritize real Database + OSM + Overpass

# ── App Initialization ──────────────────────────────────────────────────────

app = FastAPI(
    title="SmartMap Unified Backend",
    description="The complete AI logic engine for SmartMap — consolidated for maximum performance."
)

# ── CORS Middleware — MUST be added before any routes ───────────────────────
# This allows the browser to send OPTIONS preflight requests and POST to /rag
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins (frontend on any port)
    allow_credentials=True,
    allow_methods=["*"],          # Allow OPTIONS, GET, POST, etc.
    allow_headers=["*"],          # Allow Content-Type, Authorization, etc.
)

# ── Data Models ─────────────────────────────────────────────────────────────

class VerifyIDRequest(BaseModel):
    location_id: str

class QueryRequest(BaseModel):
    query: str
    location: Optional[Dict[str, float]] = None
    fast_mode: bool = True
    locations_list: Optional[List[Dict[str, Any]]] = None

class QuizSubmitRequest(BaseModel):
    location_id: str
    is_correct: bool

class GameRequest(BaseModel):
    lat: float
    lng: float
    locations_list: List[Dict[str, Any]] = []
    mode: str = "choice"

class LocationRecord(BaseModel):
    id: str
    name: str
    category: str
    image_url: Optional[str] = None
    lat: float
    lng: float
    rating: float

# ── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/")
async def status():
    return {
        "status": "online",
        "service": "SmartMap Unified Backend",
        "version": "5.0.0 (Unified)",
        "endpoints": [
            "/verify", 
            "/query", 
            "/rag", 
            "/mission/next", 
            "/mission/persona", 
            "/quiz/generate", 
            "/quiz/submit",
            "/navigation/guide"
        ]
    }

@app.get("/query", response_model=List[LocationRecord])
async def database_query(
    q: Optional[str] = Query(None),
    cat: Optional[str] = Query(None)
):
    """Simple database-driven search for locations."""
    results = locations
    if q:
        results = [l for l in results if q.lower() in l["name"].lower()]
    if cat:
        results = [l for l in results if cat.lower() == l["category"].lower()]
    return results

@app.post("/verify")
async def verify_location(record: LocationRecord):
    """
    Runs the AI Verification on a real location record from the database.
    """
    try:
        result = verify_location_image(
            record.image_url or "", 
            location_name=record.name, 
            category=record.category
        )
        return {
            **result,
            "metadata": {
                "id": record.id,
                "name": record.name,
                "category": record.category
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def fetch_backend_locations():
    """Fetches real-time locations from the Express Backend (Thread-pooled)."""
    try:
        # Use a very short timeout for "fast" response
        response = requests.get("http://localhost:5000/api/locations", timeout=1.0)
        if response.status_code == 200:
            raw_data = response.json()
            return [{
                "id": l["id"],
                "name": l["name"],
                "category": l["category"],
                "lat": l["latitude"],
                "lng": l["longitude"],
                "image_url": l["imageUrl"],
                "rating": l.get("rating", 0),
                "verification_score": l.get("verificationScore", 0)
            } for l in raw_data]
    except Exception:
        pass
    return None

@app.post("/rag")
async def rag_query(data: QueryRequest):
    """Advanced AI RAG pipeline query — optimized for speed."""
    print(f"DEBUG: RAG Query received: {data.query}")
    # Sync with Backend if no list provided
    active_locations = data.locations_list
    if not active_locations:
        print("DEBUG: Fetching live locations from Backend...")
        import anyio
        active_locations = await anyio.to_thread.run_sync(fetch_backend_locations)
        print(f"DEBUG: Fetched {len(active_locations) if active_locations else 0} locations.")

    print("DEBUG: Executing RAG Pipeline...")
    return rag_pipeline(
        data.query, 
        location=data.location, 
        fast_mode=data.fast_mode,
        locations_list=active_locations
    )

# ── Mission & Game Engine Endpoints ─────────────────────────────────────────

@app.post("/mission/next")
async def next_mission(data: GameRequest):
    """Calculates the best verification mission using real database locations."""
    return get_next_mission(data.lat, data.lng, locations_list=data.locations_list)

@app.post("/mission/persona")
async def robot_persona(data: GameRequest):
    """Triggers Gemini-powered dynamic dialogue using real nearby locations."""
    return get_gemini_persona_chat(data.lat, data.lng, locations_list=data.locations_list)

@app.post("/quiz/generate")
async def quiz_generate(data: GameRequest):
    """Generates a Map Verification Quiz using real database locations."""
    return generate_quiz(mode=data.mode, current_lat=data.lat, current_lng=data.lng, locations_list=data.locations_list)

@app.post("/quiz/submit")
async def quiz_submit(request: QuizSubmitRequest):
    """
    Submits a quiz result. Correct answers improve the map's trust data!
    """
    return submit_quiz_answer(request.location_id, request.is_correct)

@app.get("/navigation/guide")
async def nav_guide(c_lat: float, c_lng: float, t_lat: float, t_lng: float):
    """Provides human-readable navigation icons and distance updates."""
    return get_live_directions(c_lat, c_lng, t_lat, t_lng)

# ── Main Entry ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("  SmartMap Unified Backend — [PORT 5001]")
    print("  Status: All Systems Consolidated")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=5001)