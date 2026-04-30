# SmartMap Backend API 📍🚀

SmartMap is a modular, AI-powered location verification and gamification platform built for the GDG Hackathon. This backend serves as the core monolithic layer, driving location discovery, RAG-based AI search, automated image verification, competitive gamification, missions, and geography-based quizzes.

## 🏗 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma 7 (using `@prisma/adapter-pg` driver adapters)
- **AI Integrations**: Google Gemini 2.5 Flash SDK (`@google/genai`)
- **Security**: JWT Auth, bcrypt, Helmet, Express Rate Limiter
- **Media**: Local Multer instance for File Uploads

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally (or providing a cloud URI).
- A valid Google Gemini API Key.

### 2. Environment Variables (.env)
Create a `.env` file in the root folder with the following structure:
```env
# Database connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartmap?schema=public"

# JWT Secret for Auth sessions
JWT_SECRET="YOUR_SUPER_SECRET_KEY"

# Server Port
PORT=5000

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourKeyHere..."
```

### 3. Installation & Database Sync
```bash
# 1. Install all dependencies
npm install

# 2. Push schema to database and generate Prisma Client
npx prisma generate
npx prisma db push

# 3. Test Database Connection
npx tsx db-test.ts
```

### 4. Running the Server
```bash
# Development Mode (hot-reloading via Nodemon)
npm run dev

# Production Mode
npm start
```
*The server will be live on `http://localhost:5000`*

## 📚 Project Architecture
This backend utilizes a highly robust **Modular Monolith** pattern.
All logic is isolated contextually within `src/modules/*`:
- `auth/` — JWT Registration & Profile fetching
- `location/` — Core POI storage and interactions
- `verification/` — Human up/down voting logic (+ reputation systems)
- `leaderboard/` — Ranking algorithms via Prisma aggregation
- `gamification/` — Atomic transaction rewards (Points / Coins)
- `mission/` — Tiered objectives and completion tracking
- `quiz/` — Trivia questions scoped to target locations
- `navigation/` — Coordinate resolution and routing saves
- `upload/` — Local Multi-part image hosting
- `search/` — Contextual AI querying via RAG using Gemini
- `ai_verification/` — Automated image moderations through local Buffer Base64 decoding into Gemini Vision.

## 📖 Explore the Docs
- To view the detailed framework design rules, see [DOCUMENTATION.md](./DOCUMENTATION.md)
- For exhaustive Postman/cURL integration tests of ALL endpoints, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
