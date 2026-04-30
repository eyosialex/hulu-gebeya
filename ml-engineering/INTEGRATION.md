# SmartMap ML API — Integration Guide

**For:** Frontend Team & Backend/Database Team
**Base URL:** `http://localhost:5000` (local) | Replace with cloud URL when deployed
**Interactive Docs:** `http://localhost:5000/docs` (Swagger UI — test endpoints in browser)

---

> **Quick Check:** Is the ML server running?
> ```bash
> curl http://localhost:5000/
> ```
> Expected response: `{ "status": "online", "service": "SmartMap Unified Backend" }`

---

## Table of Contents

1. [Quick Start for Frontend](#1-quick-start-for-frontend)
2. [Endpoint Reference](#2-endpoint-reference)
   - [Health Check](#get-)
   - [Simple Search](#get-query)
   - [AI RAG Search](#post-rag)
   - [Image Verification](#post-verify)
   - [Get Next Mission](#get-missionnext)
   - [Robot Car Dialogue](#get-missionpersona)
   - [Generate Quiz](#get-quizgenerate)
   - [Submit Quiz Answer](#post-quizsubmit)
   - [Navigation Guide](#get-navigationguide)
3. [Data Types Reference](#3-data-types-reference)
4. [Frontend Integration Examples](#4-frontend-integration-examples)
5. [Error Handling](#5-error-handling)
6. [How Endpoints Connect Together](#6-how-endpoints-connect-together)

---

## 1. Quick Start for Frontend

The ML backend runs on **Port 5000**. Your frontend (running on Port 3000) calls it via HTTP.

### JavaScript / TypeScript fetch helper
```typescript
// utils/ml-client.ts
const ML_BASE_URL = "http://localhost:5000";

export async function mlFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${ML_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`ML API error: ${res.status}`);
  return res.json();
}
```

---

## 2. Endpoint Reference

---

### GET `/`

**Purpose:** Health check — confirm the server is running.

**Request:** No parameters.

**Response:**
```json
{
  "status": "online",
  "service": "SmartMap Unified Backend",
  "version": "5.0.0 (Unified)",
  "endpoints": ["/verify", "/query", "/rag", "/mission/next", ...]
}
```

---

### GET `/query`

**Purpose:** Simple, fast keyword/category search of the local map database.

**When to use:** Quick searches, filters, or autocomplete dropdowns.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | No | Search by name keyword (e.g. `bole`) |
| `cat` | string | No | Filter by category (e.g. `food`, `church`, `gym`) |

**Frontend call:**
```typescript
// Search for cafes
const results = await mlFetch("/query?cat=food");

// Search by name keyword
const results = await mlFetch("/query?q=bole");

// Combined
const results = await mlFetch("/query?q=bole&cat=food");
```

**Response:** Array of `LocationRecord` objects
```json
[
  {
    "id": "loc_001",
    "name": "Bole Game Zone",
    "category": "game",
    "lat": 9.03,
    "lng": 38.74,
    "rating": 4.6,
    "image_url": "http://smartmap.et/images/bole_game_verified.jpg"
  }
]
```

**Available categories:** `food`, `game`, `fitness`, `church`, `shop`, `services`

---

### POST `/rag`

**Purpose:** AI-powered search using Retrieval-Augmented Generation. Understands natural language and returns a ranked list + a Gemini-generated summary.

**When to use:** The main search bar feature.

**Request Body:**
```json
{
  "query": "find a verified cafe near Bole",
  "location": { "lat": 9.01, "lng": 38.76 },
  "fast_mode": true
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | **Yes** | — | Natural language query |
| `location` | `{lat, lng}` | No | null | User's current GPS location |
| `fast_mode` | boolean | No | `true` | Skip slow external APIs |

**Frontend call:**
```typescript
const result = await mlFetch("/rag", {
  method: "POST",
  body: JSON.stringify({
    query: "verified restaurant near Piassa",
    location: { lat: 9.01, lng: 38.74 },
    fast_mode: true,
  }),
});

console.log(result.summary);   // Gemini-generated text summary
console.log(result.locations); // Ranked array of matching locations
```

**Response:**
```json
{
  "summary": "I found 3 highly trusted restaurants near Piassa. Meskel Food Center has the highest crowd confidence with 10 confirmations.",
  "locations": [
    {
      "id": "loc_002",
      "name": "Meskel Food Center",
      "trust_score": 0.87,
      "distance_km": 0.3,
      "category": "food"
    }
  ],
  "query_received": "verified restaurant near Piassa",
  "source": "rag_pipeline"
}
```

---

### POST `/verify`

**Purpose:** Runs the 4-layer AI image verification pipeline on a location. Returns a trust verdict and detailed breakdown.

**When to use:** Admin panel, map moderation tool, or showing "Verified" badge logic.

**Request Body:**
```json
{
  "location_id": "loc_001"
}
```

**Frontend call:**
```typescript
const result = await mlFetch("/verify", {
  method: "POST",
  body: JSON.stringify({ location_id: "loc_001" }),
});

// Use the verdict to show a badge
if (result.verdict === "Verified") showVerifiedBadge();
if (result.verdict === "Fake") flagForRemoval();
```

**Response:**
```json
{
  "image_confidence": 0.831,
  "is_verified": true,
  "verdict": "Verified",
  "summary": "[OK] Image Verified: 'Bole Game Zone' meets production-ready standards. Authenticity: 87%. Sign detected: 'Bole Gaming'. Scene: game_zone. System Confidence: 83%.",
  "layers": {
    "real_photo": { "score": 0.90, "reason": "Source Trusted: images.unsplash.com" },
    "ocr":        { "score": 0.80, "reason": "Business name found", "business_name": "Bole Gaming" },
    "scene":      { "score": 0.85, "reason": "Scene 'game_zone' matches category 'game'", "scene_type": "game_zone" },
    "name_match": { "score": 0.78, "reason": "High name similarity", "similarity": 0.78 }
  },
  "metadata": {
    "id": "loc_001",
    "name": "Bole Game Zone",
    "category": "game"
  }
}
```

> **Verdict values:** `"Verified"` | `"Uncertain"` | `"Fake"`

---

### GET `/mission/next`

**Purpose:** Returns the highest-priority unverified location for the user to visit next (game mission).

**When to use:** In the game/map view when the user taps "Find Mission."

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | float | **Yes** | User's current latitude |
| `lng` | float | **Yes** | User's current longitude |

**Frontend call:**
```typescript
// Get the user's GPS from the browser
const { lat, lng } = await getUserLocation();

const mission = await mlFetch(`/mission/next?lat=${lat}&lng=${lng}`);

// Display the mission card
showMissionCard({
  name: mission.target_name,
  coords: mission.target_coords,
  reward: mission.reward,         // { coins: 130, points: 260 }
  priority: mission.priority,     // "[HIGH] Hot" or "[NORMAL] Standard"
  instruction: mission.instruction,
});
```

**Response:**
```json
{
  "mission_id": "mission_loc_006_1713529200",
  "target_id": "loc_006",
  "target_name": "Lonely Cafe (Floating)",
  "target_coords": { "lat": 8.95, "lng": 38.75 },
  "reward": { "coins": 133, "points": 267 },
  "priority": "[HIGH] Hot",
  "instruction": "Navigate to Lonely Cafe (Floating) and verify it!"
}
```

---

### GET `/mission/persona`

**Purpose:** Gets a Gemini-generated, funny/character-driven dialogue line for the Robot Car AI.

**When to use:** Displayed in the Robot Car speech bubble on the map screen.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | float | **Yes** | User's current latitude |
| `lng` | float | **Yes** | User's current longitude |

**Frontend call:**
```typescript
const persona = await mlFetch(`/mission/persona?lat=${lat}&lng=${lng}`);

// Show in speech bubble
setRobotSpeech(persona.message);
// e.g. "My hydraulics are begging for a smoothie — can we swing by Sky Gym?"
```

**Response:**
```json
{
  "message": "My fuel sensors are going haywire near that pizza place — detour approved!",
  "source": "gemini"
}
```

> If Gemini is offline, `source` will be `"fallback"` with a pre-written message.

---

### GET `/quiz/generate`

**Purpose:** Generates a map verification quiz question with a real location photo.

**When to use:** When user arrives at the mission target — show the quiz to verify.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `mode` | string | No | `"choice"` | `"choice"` (MCQ) or `"binary"` (True/False) |

**Frontend call:**
```typescript
// Multiple Choice Quiz
const quiz = await mlFetch("/quiz/generate?mode=choice");

showQuiz({
  photo: quiz.photo_url,
  question: quiz.question,       // "Identify this location:"
  options: quiz.options,         // ["Bole Game Zone", "Sky Gym", "Meskel Cafe", "St. George"]
  correctAnswer: quiz.correct_answer,
  reward: quiz.reward,           // { coins: 20, points: 50 }
  difficulty: quiz.difficulty,   // 0.5 – 1.0
});

// True/False Quiz
const quiz = await mlFetch("/quiz/generate?mode=binary");
// quiz.question = "Is this location named 'Meskel Food Center'?"
// quiz.correct_answer = "True" or "False"
```

**Response (choice mode):**
```json
{
  "quiz_id": "quiz_loc_002_847",
  "location_id": "loc_002",
  "photo_url": "http://smartmap.et/images/meskel_food.jpg",
  "question": "Identify this location:",
  "mode": "choice",
  "options": ["Meskel Food Center", "Bole Game Zone", "Sky Gym", "St. George Church"],
  "correct_answer": "Meskel Food Center",
  "difficulty": 0.67,
  "reward": { "coins": 13, "points": 33 }
}
```

---

### POST `/quiz/submit`

**Purpose:** Submits the user's quiz answer. Correct answers improve the location's trust score in the map database.

**When to use:** After user selects an answer in the quiz UI.

**Request Body:**
```json
{
  "location_id": "loc_002",
  "is_correct": true
}
```

**Frontend call:**
```typescript
const userAnswer = "Meskel Food Center";
const isCorrect = userAnswer === quiz.correct_answer;

const result = await mlFetch("/quiz/submit", {
  method: "POST",
  body: JSON.stringify({
    location_id: quiz.location_id,
    is_correct: isCorrect,
  }),
});

if (result.status === "success") {
  showRewardAnimation(result.reward); // { coins: 13, points: 33 }
  showConfirmationUpdate(result.new_confirmations);
} else {
  showWrongAnswer(result.message);
}
```

**Response (correct):**
```json
{
  "status": "success",
  "message": "[OK] Correct! You helped verify Meskel Food Center.",
  "confirmation_added": 0.399,
  "new_confirmations": 2.4,
  "reward": { "coins": 11, "points": 28 }
}
```

**Response (wrong):**
```json
{
  "status": "wrong",
  "message": "Oops! That's not the correct answer.",
  "reward": { "coins": 0, "points": 5 }
}
```

---

### GET `/navigation/guide`

**Purpose:** Real-time turn-by-turn navigation from user to a mission target.

**When to use:** While the user is walking/driving to the mission location.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `c_lat` | float | **Yes** | **C**urrent user latitude |
| `c_lng` | float | **Yes** | **C**urrent user longitude |
| `t_lat` | float | **Yes** | **T**arget location latitude |
| `t_lng` | float | **Yes** | **T**arget location longitude |

**Frontend call:**
```typescript
// Call every 3–5 seconds as user moves
const nav = await mlFetch(
  `/navigation/guide?c_lat=${userLat}&c_lng=${userLng}&t_lat=${target.lat}&t_lng=${target.lng}`
);

// Show on map UI
setNavInstruction(nav.instruction);  // "Turn right ➡️"
setNavIcon(nav.icon);                // "➡️"
setNavDistance(`${nav.distance_m}m`); // "245.3m"

if (nav.arrived) {
  showArrivalScreen(); // Trigger quiz
}
```

**Response:**
```json
{
  "instruction": "Turn right",
  "icon": "right",
  "distance_m": 245.3,
  "arrived": false
}
```

**Direction values:**
| `instruction` | Meaning |
|---|---|
| `"Go straight"` | Bearing within ±30° |
| `"Turn right"` | Bearing +30° to +150° |
| `"Turn left"` | Bearing -30° to -150° |
| `"Make a U-Turn"` | Bearing > ±150° |
| `"You have arrived!"` | Distance < 30 metres |

---

## 3. Data Types Reference

### `LocationRecord`
```typescript
interface LocationRecord {
  id: string;           // e.g. "loc_001"
  name: string;         // e.g. "Bole Game Zone"
  category: string;     // "food" | "game" | "church" | "gym" | "shop" | "services" | "fitness"
  lat: number;          // e.g. 9.03
  lng: number;          // e.g. 38.74
  rating: number;       // 1.0 – 5.0
  image_url: string | null;
}
```

### `VerificationResult`
```typescript
interface VerificationResult {
  image_confidence: number;   // 0.0 – 1.0
  is_verified: boolean;
  verdict: "Verified" | "Uncertain" | "Fake";
  summary: string;
  layers: {
    real_photo: { score: number; reason: string; is_real: boolean };
    ocr: { score: number; reason: string; business_name: string };
    scene: { score: number; reason: string; scene_type: string };
    name_match: { score: number; reason: string; similarity: number };
  };
  metadata: { id: string; name: string; category: string };
}
```

### `QuizResult`
```typescript
interface QuizResult {
  quiz_id: string;
  location_id: string;
  photo_url: string;
  question: string;
  mode: "choice" | "binary";
  options?: string[];           // Only in "choice" mode
  correct_answer: string;       // Name in choice, "True"/"False" in binary
  difficulty: number;           // 0.5 – 1.0
  reward: { coins: number; points: number };
}
```

---

## 4. Frontend Integration Examples

### Complete Game Flow (React)
```typescript
async function startMission(userLat: number, userLng: number) {
  // 1. Get robot car dialogue
  const persona = await mlFetch(`/mission/persona?lat=${userLat}&lng=${userLng}`);
  setRobotSpeech(persona.message);

  // 2. Get next mission
  const mission = await mlFetch(`/mission/next?lat=${userLat}&lng=${userLng}`);
  setActiveMission(mission);

  // 3. Start navigation loop
  const navInterval = setInterval(async () => {
    const nav = await mlFetch(
      `/navigation/guide?c_lat=${userLat}&c_lng=${userLng}&t_lat=${mission.target_coords.lat}&t_lng=${mission.target_coords.lng}`
    );
    updateNavUI(nav);

    if (nav.arrived) {
      clearInterval(navInterval);

      // 4. Generate quiz when user arrives
      const quiz = await mlFetch("/quiz/generate?mode=choice");
      showQuizModal(quiz);
    }
  }, 3000);
}

async function submitAnswer(quiz: QuizResult, userAnswer: string) {
  const result = await mlFetch("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({
      location_id: quiz.location_id,
      is_correct: userAnswer === quiz.correct_answer,
    }),
  });

  showResultScreen(result);
}
```

---

## 5. Error Handling

All endpoints return standard HTTP error codes:

| Code | Meaning | When |
|---|---|---|
| `200` | Success | Normal response |
| `404` | Not Found | `location_id` doesn't exist |
| `422` | Validation Error | Missing required field |
| `500` | Server Error | AI model quota, or internal crash |

**Error response format:**
```json
{
  "detail": "Location ID 'loc_999' not found."
}
```

**Frontend error handler:**
```typescript
try {
  const result = await mlFetch("/verify", { ... });
} catch (err) {
  if (err.message.includes("404")) showToast("Location not found");
  else if (err.message.includes("500")) showToast("AI service temporarily unavailable");
}
```

---

## 6. How Endpoints Connect Together

```
User opens app
    │
    ├─ GET /mission/persona    ← Robot car speech bubble
    ├─ GET /mission/next       ← Mission card (target + reward)
    │
    └─ [User walks to location]
         │
         ├─ GET /navigation/guide  ← Called every 3s for directions
         │
         └─ [arrived = true]
              │
              ├─ GET /quiz/generate  ← Show quiz photo + options
              │
              └─ POST /quiz/submit   ← Submit answer → update trust score
                   │
                   └─ [Show reward + next mission]


User uses search bar
    │
    └─ POST /rag              ← AI natural language search
         │
         └─ POST /verify      ← Admin: check individual location image
```

---

> **Questions?** Check the live Swagger docs at `http://localhost:5000/docs`
> or contact the ML Engineering team.
