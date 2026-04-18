# SmartMap API Documentation & Testing Guide 📍🚀

This guide provides a comprehensive overview of the SmartMap backend API. It includes endpoint descriptions, request/response examples, and a step-by-step testing flow for Postman.

---

## 🛠 Required Headers

Across all protected endpoints, ensure the following headers are set:

| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | ✅ All POST/PUT requests |
| `Authorization` | `Bearer <YOUR_JWT_TOKEN>` | ✅ Protected routes |

---

## 1. Auth Module 🔐

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login and get JWT | ❌ No |

### [POST] /api/auth/register
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "3b3b3ee0-e624-4992-88f5-3e9efd4aa444",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "reputationScore": 0,
    "points": 20,
    "coins": 10
  }
}
```
**Error Response (400 Bad Request):**
```json
{ "error": "\"email\" must be a valid email" }
```

---

## 2. Location Module 📍

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/locations` | Add a new location | ✅ Yes |
| `GET` | `/api/locations` | Get all locations | ❌ No |
| `GET` | `/api/locations/:id` | Get location by ID | ❌ No |

### [POST] /api/locations
**Request Body:**
```json
{
  "name": "Central Park",
  "description": "A large public park in NYC",
  "category": "Park",
  "latitude": 40.785091,
  "longitude": -73.968285
}
```
**Success Response (201 Created):**
```json
{
  "message": "Location submitted for verification",
  "location": {
    "id": "a1b2c3d4...",
    "name": "Central Park",
    "verificationScore": 0,
    "status": "PENDING"
  }
}
```

---

## 3. Verification Module 🗳️

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/verifications` | Vote UP/DOWN on a location | ✅ Yes |

### [POST] /api/verifications
**Request Body:**
```json
{
  "locationId": "a1b2c3d4...",
  "vote": "UP",
  "confidence": 0.9
}
```
**Success Response (200 OK):**
```json
{
  "message": "Verification submitted successfully",
  "result": {
    "id": "v1v2v3...",
    "vote": "UP",
    "createdAt": "..."
  }
}
```
**Edge Case (Duplicate Vote):**
The system uses an atomic `upsert`. If you vote again on the same location, the existing vote is updated, preventing point spamming.

---

## 4. Leaderboard Module 🏆

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaderboard` | Get user rankings | ❌ No |

**Query Parameters:**
- `timeframe`: `daily`, `weekly`, or `lifetime` (default)

**Success Response (200 OK):**
```json
{
  "timeframe": "weekly",
  "leaderboard": [
    {
      "userId": "3b3b3ee0...",
      "name": "Jane Doe",
      "pointsEarned": 25,
      "reputationScore": 0.1
    }
  ]
}
```

---

## ⚠️ Missing Modules (Not Implemented Yet)
The following modules were requested but are not currently implemented in the codebase:
- **Gamification**: (Logic exists in services, but no standalone `/api/gamification` endpoints).
- **Missions**: ❌ Not started.
- **Quizzes**: ❌ Not started.
- **Navigation**: ❌ Not started.
- **Upload**: ❌ Not started (Cloudinary/Multer dependencies are ready, but routes aren't mapped).

---

## 🔄 Complete Testing Flow

1. **Step 1: Register**
   - Use `POST /api/auth/register` to create a user. Ensure you get 20 points instantly.
2. **Step 2: Login**
   - Use `POST /api/auth/login`.
   - **Copy the `token` from the response.**
3. **Step 3: Setup Postman Auth**
   - In your Postman collection, go to the **Authorization** tab.
   - Select **Bearer Token** and paste your token.
4. **Step 4: Create a Location**
   - Use `POST /api/locations`. Verify you get +20 points in your activity log.
5. **Step 5: Verify (Vote)**
   - Use `POST /api/verifications` using the `id` from the created location.
6. **Step 6: Check Leaderboard**
   - Check `GET /api/leaderboard?timeframe=daily` to see your name at the top!

---

## 🛑 Edge Cases & Error Handling

- **Invalid Input**: Try sending a latitude of `200`. Joi will return: `{"error": "\"latitude\" must be less than or equal to 90"}`.
- **Unauthorized Access**: Call `/api/locations` without a token. You will get `{"error": "Not authorized"}`.
- **Duplicate Verification**: Submitting multiple votes for the same location only records one entry per user as per DB-level unique constraints.
