# SmartMap ML Engineering — Technical Documentation

> **SmartMap** is a crowdsourced, AI-powered location verification system for Addis Ababa, Ethiopia.
> The `ml-engineering` module is the intelligence layer that validates, ranks, and gamifies map data.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How to Run](#2-how-to-run)
3. [System Architecture](#3-system-architecture)
4. [Module Reference](#4-module-reference)
   - [API Entry Point](#41-api-entry-point-mainpy)
   - [RAG Search Engine](#42-rag-search-engine-enginesragpy)
   - [Image Verification Engine](#43-image-verification-engine-enginesverification)
   - [Trust Engine](#44-trust-engine-enginestrust_enginepy)
   - [Game Agent](#45-game-agent-gamemission_enginepy)
   - [Geo Detection](#46-geo-detection-enginesgeo_detectiondetectorpy)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Key Algorithms Explained](#6-key-algorithms-explained)
7. [Test Suite](#7-test-suite)

---

## 1. Project Structure

```
ml-engineering/
│
├── main.py                      # Unified FastAPI entry point (Port 5000)
├── .env                         # GEMINI_API_KEY goes here
│
├── engines/                     # Core AI/ML Logic — "The Brains"
│   ├── rag.py                   # RAG-powered search & location retrieval
│   ├── trust_engine.py          # 6-factor adversarial trust scoring
│   ├── recommender.py           # Location recommendation engine
│   ├── geo_detection/
│   │   └── detector.py          # District-aware geo consistency checks
│   └── verification/
│       ├── image_verifier.py    # Master orchestrator (4-layer pipeline)
│       ├── real_photo_detector.py  # L1: Is it a real photo?
│       ├── ocr_extractor.py     # L2: What does the sign say?
│       ├── analysis.py          # L3: What scene is this?
│       └── name_matcher.py      # L4: Does the name match the database?
│
├── game/
│   └── mission_engine.py        # AI Robot Car game agent (8 anti-fraud fixes)
│
├── data/
│   ├── data.py                  # Local mock database (locations)
│   └── datasets/                # Static datasets for training/evaluation
│
├── tests/                       # Automated Test Suite
│   ├── test_full_verification.py
│   ├── test_trust_engine.py
│   └── test_mission_engine.py
│
└── research/
    ├── experiments/             # Logged experiment results
    └── scratch/                 # Debug & research scripts
```

---

## 2. How to Run

### Prerequisites
```bash
pip install fastapi uvicorn google-genai pillow requests python-dotenv
```

### Environment Setup
Create `ml-engineering/.env`:
```
GEMINI_API_KEY=your_key_here
```

### Start the Server
```bash
cd ml-engineering
python main.py
```
Server runs at: **http://localhost:5000**
Interactive docs: **http://localhost:5000/docs**

### Run Tests
```bash
python tests/test_full_verification.py    # Image Verification
python tests/test_trust_engine.py         # Trust Engine (6 mods)
python tests/test_mission_engine.py       # Game Agent (8 fixes)
```

---

## 3. System Architecture

```
USER REQUEST
    │
    ├──────────────────────────────────────────────────┐
    │  POST /search  (RAG Pipeline)                   │  POST /verify (Image AI)
    │                                                  │
    ▼                                                  ▼
┌──────────────────────────┐           ┌──────────────────────────────────┐
│  RAG ENGINE (rag.py)     │           │  IMAGE VERIFICATION PIPELINE     │
│                          │           │                                  │
│  1. Parse user query     │           │  L1: Real Photo Check  (25%)     │
│  2. Retrieve from DB     │           │    - EXIF metadata               │
│  3. Fetch from OSM/API   │           │    - Resolution & aspect ratio   │
│  4. Score & rank         │           │    - ELA pixel analysis          │
│  5. Gemini summary       │           │    - Gemini AI vision            │
└──────────┬───────────────┘           │                                  │
           │                           │  L2: OCR / Text Signs  (25%)     │
           ▼                           │    - Extract business name       │
┌──────────────────────────┐           │    - Detect Amharic text         │
│  TRUST ENGINE            │  ◄────────│                                  │
│  (trust_engine.py)       │           │  L3: Scene Match       (25%)     │
│                          │           │    - Ethiopian-context labels    │
│  MOD 1: Dynamic Weights  │           │    - Category consistency check  │
│  MOD 2: Weighted Crowd   │           │                                  │
│  MOD 3: Category Decay   │           │  L4: Name Match        (25%)     │
│  MOD 4: Geo Intelligence │           │    - OCR text vs DB name         │
│  MOD 5: Risk Penalty     │           │    - String similarity score     │
│  MOD 6: Multi-Image Boost│           └──────────────────────────────────┘
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  GAME AGENT              │
│  (mission_engine.py)     │
│                          │
│  FIX 1: Weighted confs   │
│  FIX 2: Mission cooldown │
│  FIX 3: Real distractors │
│  FIX 4: Reputation gate  │
│  FIX 5: Multi-signal     │
│  FIX 6: Image quality    │
│  FIX 7: Entropy missions │
│  FIX 8: Anti-collusion   │
└──────────────────────────┘
```

---

## 4. Module Reference

### 4.1 API Entry Point — `main.py`

The single, unified FastAPI server that exposes all endpoints.

**Key design decision:** Consolidated from a fragmented `app/main.py` + root `main.py` into a single production entry point.

---

### 4.2 RAG Search Engine — `engines/rag.py`

**What it does:** Retrieves the most relevant, highest-trust locations for a user query using Retrieval-Augmented Generation.

**Pipeline:**
1. Parse natural-language query (e.g. "find a cafe near Bole")
2. Search internal `data.py` database
3. Optionally fetch live data from OpenStreetMap Overpass API
4. Score and rank results using Trust Engine
5. Generate a human-readable Gemini summary

**Key endpoint:** `POST /search`
```json
{ "query": "find a verified cafe near Bole", "lat": 9.01, "lng": 38.76 }
```

---

### 4.3 Image Verification Engine — `engines/verification/`

**What it does:** Runs a 4-layer AI pipeline to determine if a submitted image genuinely represents the claimed location.

#### Layer Breakdown

| Layer | File | Weight | Checks |
|---|---|---|---|
| **L1 Real Photo** | `real_photo_detector.py` | 25% | EXIF metadata, resolution, aspect ratio, ELA pixel analysis, Gemini AI |
| **L2 OCR / Signs** | `ocr_extractor.py` | 25% | Extracts business name & Amharic text from signs |
| **L3 Scene Match** | `analysis.py` | 25% | Classifies scene using Ethiopian-context Gemini labels |
| **L4 Name Match** | `name_matcher.py` | 25% | Compares OCR text to the database location name |

#### Verdict Thresholds
| Score | Verdict |
|---|---|
| >= 0.75 | ✅ Verified |
| >= 0.50 | ⚠️ Uncertain |
| < 0.50  | ❌ Fake |

**Key endpoint:** `POST /verify`

---

### 4.4 Trust Engine — `engines/trust_engine.py`

**What it does:** Calculates a final Trust Score for any location using 4 pillars and 6 smart modifiers.

#### The 4 Pillars

| Pillar | Weight | Description |
|---|---|---|
| Contributor Reputation | 25–30% | How trusted is the submitter? |
| Crowd Quality | 10–45% | Weighted by individual confirmer reputation — **not raw vote count** |
| Image Confidence | 10–40% | Output of the 4-layer image pipeline |
| Geo Intelligence | 20% | Is location in a known Addis Ababa business district? |

#### The 6 Smart Modifiers

| # | Modifier | Effect |
|---|---|---|
| MOD 1 | **Dynamic Weights** | `image_weight` = 40% for new locations, drops to 10% as crowd grows |
| MOD 2 | **Weighted Confirmations** | `crowd = log(n) × avg_confirmer_rep` — 10 bots score 0.07, not 1.0 |
| MOD 3 | **Category-Aware Decay** | Church decays slowly (floor 0.85), Food stall decays fast (floor 0.45) |
| MOD 4 | **Geo Intelligence** | Bole/Piassa → 1.0, rural Ethiopia → 0.3, off-map → 0.05 |
| MOD 5 | **Category Risk Penalty** | Government office: -0.25, Cafe: -0.05 |
| MOD 6 | **Multi-Image Boost** | Each extra image adds +0.02, max +0.10 |

#### Final Formula
```python
score = (rep × w_rep) + (crowd × w_crowd) + (image × w_image) + (geo × w_geo)
score *= category_time_decay
score += image_bonus
score -= risk_penalty
```

**Verdict Thresholds:**
| Score | Status |
|---|---|
| >= 0.80 | ✅ Verified |
| >= 0.55 | ⚠️ Warning |
| >= 0.35 | 🔶 Low Trust |
| < 0.35  | ❌ Fake / Suspicious |

---

### 4.5 Game Agent — `game/mission_engine.py`

**What it does:** Turns map verification into a game — an AI Robot Car assigns missions, generates quizzes, and rewards users for verifying locations.

**The core insight:** Every quiz answer is a verified human signal that feeds the Trust Engine. The game IS the data collection engine.

#### The Game Loop
```
Robot Car suggests a nearby unverified location
    → User navigates there
    → Quiz: "Identify this location" (real photo shown)
    → User answers correctly
    → confirmation_weight added (not raw +1)
    → Trust Engine score improves
    → Location appears higher in search results
```

#### 8 Anti-Fraud Fixes

| # | Fix | Problem Solved |
|---|---|---|
| FIX 1 | **Weighted Confirmations** | `weight = difficulty × reputation`, not `+1` |
| FIX 2 | **Mission Cooldown** | 6-hour cooldown per location per user — stops farming |
| FIX 3 | **Real Distractors** | Quiz options come from real DB locations — no AI hallucination |
| FIX 4 | **Reputation Gate** | `rep=0.04` → confirmation adds only `0.035` |
| FIX 5 | **Multi-Signal Confirmation** | `weight = quiz(60%) + GPS(20%) + image(20%)` |
| FIX 6 | **Image Quality Filter** | Blocks broken/scam image URLs before quiz |
| FIX 7 | **Entropy-Based Missions** | Prioritises high-disagreement, low-trust locations |
| FIX 8 | **Anti-Collusion Detection** | 4+ users confirm same place in 5 min → flagged |

---

### 4.6 Geo Detection — `engines/geo_detection/detector.py`

**What it does:** Validates that a location's GPS coordinates are in a real, populated area.

#### 4-Tier Scoring
| Location | Score |
|---|---|
| Bole, Piassa, Merkato, Kazanchis, CMC | **1.0** |
| Inside Addis city limits (with road/building proximity) | **0.7** |
| Rural Ethiopia (outside Addis) | **0.3** |
| Off the map (not Ethiopia) | **0.05** |

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/search` | RAG-powered location search |
| `POST` | `/verify` | Run 4-layer image verification |
| `GET`  | `/mission/next` | Get next mission for the robot car game |
| `GET`  | `/mission/persona` | Get Gemini robot car personality dialogue |
| `GET`  | `/quiz/generate` | Generate a map verification quiz |
| `POST` | `/quiz/submit` | Submit a quiz answer (updates trust) |
| `GET`  | `/navigation/guide` | Get turn-by-turn navigation to a target |

---

## 6. Key Algorithms Explained

### Haversine Distance (Navigation)
Used to calculate real-world distance between GPS coordinates:
```python
R = 6371  # Earth radius in km
a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
distance = R × 2 × atan2(√a, √(1−a))
```

### Logarithmic Crowd Scaling (Trust Engine)
Prevents a single person with 1,000 fake accounts from dominating:
```
1 confirmation  → 0.40
3 confirmations → 0.80
10 confirmations → 1.00  (diminishing returns)
```

### Category-Aware Time Decay (Trust Engine)
```python
decay = max(floor, 1.0 - (days_old / rate))
# Church: rate=3650, floor=0.85  (barely decays over 10 years)
# Food:   rate=270,  floor=0.45  (loses trust in ~9 months)
```

---

## 7. Test Suite

| Test File | What It Validates |
|---|---|
| `tests/test_full_verification.py` | All 4 image verification layers + new verdict labels |
| `tests/test_trust_engine.py` | Bot resistance, weighted crowd, time decay, geo scoring |
| `tests/test_mission_engine.py` | Cooldown, distractors, weighted confirmations, reputation gate |

### Quick Demo Command (for Hackathon)
```bash
python tests/test_trust_engine.py
# → TEST 2 shows a bot attack scoring 0.000
# → Most powerful proof of adversarial resistance
```

---

> **Built for:** GDD Hackathon — SmartMap, Addis Ababa, Ethiopia
> **Core Tech:** FastAPI · Google Gemini 2.0 Flash · Pillow · OpenStreetMap Overpass API
