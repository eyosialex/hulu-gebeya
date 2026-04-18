"""
app/main.py — SmartMap Unified API Entry Point
==============================================
"""
import os
import sys
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Ensure the root directory is in the path for modular imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Perfect Structure Imports
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
from data.data import locations

# ── App Initialization ──────────────────────────────────────────────────────

app = FastAPI(
    title="SmartMap Perfect API",
    description="Unified API with Image Verification, RAG, and AI Game Engine."
)

# ── Data Models ─────────────────────────────────────────────────────────────

class VerifyIDRequest(BaseModel):
    location_id: str

class QueryRequest(BaseModel):
    query: str
    location: Optional[dict] = None
    fast_mode: bool = True

class QuizSubmitRequest(BaseModel):
    location_id: str
    is_correct: bool

# ── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/")
async def status():
    return {
        "status": "online",
        "version": "4.1.0 (Advanced Quiz Engine)",
        "endpoints": ["/verify", "/query", "/rag", "/mission/next", "/mission/persona", "/quiz/generate", "/quiz/submit"]
    }

@app.get("/query")
async def database_query(q: Optional[str] = Query(None), cat: Optional[str] = Query(None)):
    results = locations
    if q: results = [l for l in results if q.lower() in l["name"].lower()]
    if cat: results = [l for l in results if cat.lower() == l["category"].lower()]
    return results

@app.post("/verify")
async def verify_location(request: VerifyIDRequest):
    record = next((l for l in locations if l["id"] == request.location_id), None)
    if not record: raise HTTPException(status_code=404, detail="ID not found")
    
    try:
        result = verify_location_image(record["image_url"], record["name"], record["category"])
        return {**result, "metadata": {"id": record["id"], "name": record["name"]}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag")
async def rag_query(data: QueryRequest):
    return rag_pipeline(data.query, location=data.location, fast_mode=data.fast_mode)

# ── Game, Persona & Verification Quiz ──────────────────────────────────────

@app.get("/mission/next")
async def next_mission(lat: float, lng: float):
    return get_next_mission(lat, lng)

@app.get("/mission/persona")
async def robot_persona(lat: float, lng: float):
    """Triggers Gemini-powered dynamic dialogue for the Robotic Car."""
    return get_gemini_persona_chat(lat, lng)

@app.get("/quiz/generate")
async def quiz_generate(mode: str = "choice"):
    """
    Generates a Map Verification Quiz.
    Modes: 'choice' (MCQ) or 'binary' (True/False)
    """
    return generate_quiz(mode=mode)

@app.post("/quiz/submit")
async def quiz_submit(request: QuizSubmitRequest):
    """
    Submits a quiz result. Correct answers improve the map's trust data!
    """
    return submit_quiz_answer(request.location_id, request.is_correct)

@app.get("/navigation/guide")
async def nav_guide(c_lat: float, c_lng: float, t_lat: float, t_lng: float):
    return get_live_directions(c_lat, c_lng, t_lat, t_lng)

# ── Main Entry ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)