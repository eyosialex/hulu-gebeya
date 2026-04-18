"""
mission_engine.py — The SmartMap Perfect Game Brain
===================================================
Handles Robot Missions, Gemini Persona, and Reward calculations.
"""
import math
import random
import os
from typing import Dict, List, Optional
from google import genai
from google.genai import types
from data.data import locations  # Fixed path

# ── Gemini Setup ────────────────────────────────────────────────────────────

def _get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

# ── Mission Generator ────────────────────────────────────────────────────────

def get_next_mission(current_lat: float, current_lng: float) -> dict:
    targets = []
    for loc in locations:
        if loc.get("confirmations", 0) < 5 or loc.get("rating", 0.0) < 4.5:
            dist = _haversine(current_lat, current_lng, loc["lat"], loc["lng"])
            targets.append((dist, loc))
    
    targets.sort(key=lambda x: x[0])
    if not targets:
        return {"error": "No missions currently available nearby."}
    
    dist, best_loc = targets[0]
    coins, points = _calculate_rewards(dist, best_loc)
    
    return {
        "mission_id": f"mission_{best_loc['id']}",
        "target_id": best_loc["id"],
        "target_name": best_loc["name"],
        "target_coords": {"lat": best_loc["lat"], "lng": best_loc["lng"]},
        "reward": {"coins": coins, "points": points},
        "instruction": f"Navigate to {best_loc['name']} and verify it!"
    }

# ── Gemini Persona & Dialogue ────────────────────────────────────────────────

def get_gemini_persona_chat(current_lat: float, current_lng: float) -> dict:
    """Uses Gemini to generate personality-driven dialogue based on surroundings."""
    client = _get_gemini_client()
    if not client:
        return {"message": "I need some food. Can we find a place?", "source": "fallback"}

    # Find nearby categories
    nearby = []
    for loc in locations:
        dist = _haversine(current_lat, current_lng, loc["lat"], loc["lng"])
        if dist < 0.5: # 500m
            nearby.append(f"{loc['name']} ({loc['category']})")
    
    nearby_text = ", ".join(nearby[:3])
    prompt = f"""
    You are a friendly AI Robot Car helping a user in a mapping game. 
    Your current location is nearby: {nearby_text}.
    Choose ONE nearby place and say something very creative, funny, or character-driven about why you want to visit it.
    Keep it short (1 sentence). 
    Example: 'My fuel cells are craving that Meskel Pizza, can we take a cheesy detour?'
    """
    
    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return {"message": response.text.strip(), "source": "gemini"}
    except:
        return {"message": "I smell something interesting nearby... let's explore!", "source": "fallback"}

# ── Gemini Photo Quiz ───────────────────────────────────────────────────────

def generate_quiz(mode: str = "choice") -> dict:
    """
    Generates a quiz for map verification.
    Modes: 
      - 'choice': 4 realistic options
      - 'binary': True/False statement
    """
    loc_with_img = [l for l in locations if l.get("image_url")]
    if not loc_with_img:
        return {"error": "No quiz images available."}
    
    target = random.choice(loc_with_img)
    client = _get_gemini_client()
    
    if mode == "binary":
        is_correct_match = random.choice([True, False])
        display_name = target["name"]
        
        if not is_correct_match:
            # Generate a fake name via Gemini
            if client:
                prompt = f"The correct place is '{target['name']}' ({target['category']}). Generate ONE DIFFERENT realistic name for a place in this category."
                try:
                    res = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
                    display_name = res.text.strip()
                except:
                    display_name = "Shadow Center (Fake)"
            else:
                display_name = "Mystery Spot"
                
        return {
            "quiz_id": f"quiz_{target['id']}_{random.randint(100,999)}",
            "location_id": target["id"],
            "photo_url": target["image_url"],
            "question": f"Is this location named '{display_name}'?",
            "mode": "binary",
            "correct_answer": "True" if is_correct_match else "False",
            "reward": {"coins": 20, "points": 50}
        }
    
    else: # Mode: Choice
        options = [target["name"]]
        if client:
            prompt = f"The correct place is '{target['name']}' ({target['category']}). Generate 3 FAKE but realistic names for places in this category. Return ONLY comma-separated names."
            try:
                res = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
                fakes = [f.strip() for f in res.text.split(",")]
                options.extend(fakes[:3])
            except:
                options.extend(["Fake 1", "Fake 2", "Fake 3"])
        else:
            options.extend(["Place A", "Place B", "Place C"])
            
        random.shuffle(options)
        return {
            "quiz_id": f"quiz_{target['id']}_{random.randint(100,999)}",
            "location_id": target["id"],
            "photo_url": target["image_url"],
            "question": "Identify this location:",
            "mode": "choice",
            "options": options,
            "correct_answer": target["name"],
            "reward": {"coins": 20, "points": 50}
        }

def submit_quiz_answer(location_id: str, is_correct: bool) -> dict:
    """
    Handles quiz submission results.
    If 'is_correct' is True, it increments the location's trust confirmations.
    """
    target = next((l for l in locations if l["id"] == location_id), None)
    if not target:
        return {"error": "Location not found"}
    
    if is_correct:
        # ── CROWDSOURCED VERIFICATION ──
        # Increment confirmations in memory
        target["confirmations"] = target.get("confirmations", 0) + 1
        
        return {
            "status": "success",
            "message": f"Correct! Verification for {target['name']} improved.",
            "reward": {"coins": 20, "points": 50},
            "new_confirmations": target["confirmations"]
        }
    else:
        return {
            "status": "wrong",
            "message": "Oops! That's not the correct answer.",
            "reward": {"coins": 0, "points": 5}
        }

# ── Navigation & Math ────────────────────────────────────────────────────────

def get_live_directions(current_lat: float, current_lng: float, target_lat: float, target_lng: float) -> dict:
    dist = _haversine(current_lat, current_lng, target_lat, target_lng)
    bearing = _calculate_bearing(current_lat, current_lng, target_lat, target_lng)
    
    if dist < 0.03:
        direction, icon = "You have arrived! 🏁", "📍"
    elif -30 <= bearing <= 30:
        direction, icon = "Go straight ⬆️", "⬆️"
    elif 30 < bearing <= 150:
        direction, icon = "Turn right ➡️", "➡️"
    elif -150 <= bearing < -30:
        direction, icon = "Turn left ⬅️", "⬅️"
    else:
        direction, icon = "Make a U-Turn ⬇️", "⬇️"
        
    return {
        "instruction": direction,
        "icon": icon,
        "distance_m": round(dist * 1000, 1),
        "arrived": dist < 0.03
    }

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat, dlon = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def _calculate_bearing(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    y = math.sin(lon2-lon1) * math.cos(lat2)
    x = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(lon2-lon1)
    return math.degrees(math.atan2(y, x))

def _calculate_rewards(distance, location):
    return (50 + int(distance * 10), 100 + int(distance * 20))
