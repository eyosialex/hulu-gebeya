# SmartMap Exhaustive API Documentation 📍🚀

This guide provides a comprehensive overview of every single mapped route available on the SmartMap backend. It details exactly what data is expected, what outputs return, and any Authentication overrides applied.

---

## 🛠 Required Headers

Across all protected endpoints (✅ Auth Required), ensure the following headers are set:

| Header | Value | Condition |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Mandatory for POST/PUT |
| `Authorization` | `Bearer <YOUR_JWT_TOKEN>` | Mandatory if Protected |

---

## 1. Auth Module 🔐 (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register new user. | ❌ |
| `POST` | `/login` | Login and issue JWT. | ❌ |
| `POST` | `/logout` | Revoke a session token locally. | ✅ |
| `GET`  | `/me` | Retrieve active profile data. | ✅ |

### Example Integration (Auth Check)
**`GET /api/auth/me`**
```json
{
  "id": "e5b...",
  "name": "John Doe",
  "email": "john@smartmap.io",
  "role": "USER",
  "points": 100,
  "coins": 30
}
```

---

## 2. Location Module 📍 (`/api/locations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submit new location. | ✅ |
| `GET`  | `/` | List all available locations (`?category=Park`). | ❌ |
| `GET`  | `/nearby` | Haversine proximity query (`?lat=&lng=&radius=`). | ❌ |
| `GET`  | `/:id` | Get explicit Location details. | ❌ |
| `PUT`  | `/:id` | Update parameters (Owner or Admin only). | ✅ |
| `DELETE`| `/:id` | Strip from system completely (Admin only). | ✅ |

### Example Integration (Nearby Search)
**`GET /api/locations/nearby?lat=40.7128&lng=-74.0060&radius=15`**
Returns standard locations appended with an algorithmic `distance` property calculating precise Kilometers between the User bounds and the DB Coordinate hooks.

---

## 3. Human Verification 🗳️ (`/api/locations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/:id/verify` | Atomic Up/Down vote interaction. | ✅ |
| `GET`  | `/:id/verifications` | Get voting history of a location. | ❌ |

**Payload expected for Verify:** `{ "vote": "UP", "confidence": 0.8 }`

---

## 4. RAG AI Search 🔎 (`/api/search`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST`  | `/rag` | Semantic LLM database querying. | ❌ |

**Payload**: `{ "query": "Find me the best local historical museums" }`
*(Generates strict text outputs utilizing Gemini mapping all APPROVED locations in Postgres as its source-of-truth).*

---

## 5. Automated AI Moderation 🤖 (`/api`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST`  | `/locations/:id/ai-verify` | Boot vision parser against location image. | ✅ |

*(Strips the location buffer locally, encodes it via Base64, scans it natively on Google Cloud APIs, and forces the DB `status` immediately to APPROVED or REJECTED. Issues immediate coins to User).*

---

## 6. Leaderboard Engine 🏆 (`/api/leaderboard`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET`  | `/` | Global ranked fetching. | ❌ |
| `GET`  | `/daily` | Timeboxed rankings (Last 24 Hours). | ❌ |
| `GET`  | `/weekly` | Timeboxed rankings (Last 7 Days). | ❌ |

---

## 7. Gamification Tracking 🎮 (`/api/gamification`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/activity` | Retrieves logged rewards stream natively. | ✅ |

---

## 8. Missions Framework 🏃 (`/api/missions`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieves active platform missions. | ❌ |
| `POST`| `/` | Admin control to forge global missions. | ✅ (Admin) |
| `POST`| `/:id/start` | Assign mission to active user tree. | ✅ |
| `POST`| `/:id/complete` | Close state, triggers Gamification. | ✅ |

---

## 9. Trivia Quiz System 🧠 (`/api/quizzes`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Load all available quizzes dynamically (`?locationId=`). | ❌ |
| `POST`| `/` | Forge trivial rules locally. | ✅ (Admin) |
| `POST`| `/:id/answer` | Test string answer dynamically enforcing limits. | ✅ |

**Payload expected for Admin create**:
`{ "question": "...", "correctAnswer": "...", "points": 10, "coins": 5, "locationId": "..." }`

---

## 10. File Integration 📸 (`/api/upload`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Multer multi-part ingestion. | ✅ |

**Payload expected**: `multipart/form-data` -> Key: `image`. 
Returns a local static slug (e.g. `/uploads/123984-test.png`) formatted specifically for Location `imgUrls` storage.

---

## 11. Navigation System 🗺️ (`/api/navigation`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` / `POST` | `/route` | Distance simulator enforcing Haversine maths. | ❌ |
| `POST`| `/save` | Write offline arrays statically to Postgres instances. | ✅ |
| `GET` | `/saved` | Query stored geometries. | ✅ |

**Waypoints Architecture**: JSON arrays enforcing strict latitude/longitude schema checks.

---

## 🔄 Complete Backend Testing Flow (Postman)

1. **Upload an Image**: `POST /api/upload` (Save the `imageUrl`).
2. **Create Location**: `POST /api/locations` (Bind the image inside the payload).
3. **Auto-Verify**: `POST /api/locations/<ID>/ai-verify`.
4. **Search Semantically**: `POST /api/search/rag` ("Tell me about the location I just uploaded").
5. **Get Rewarded**: Route toward `GET /api/gamification/activity` to view AI bonus payouts tracking automatically!
