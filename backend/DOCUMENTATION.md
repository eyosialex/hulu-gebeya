# SmartMap Technical Documentation 📚

## 🏗 System Architecture
The backend is completely deployed under a **Modular Monolith** architecture. Every component operates autonomously inside its feature boundary (`src/modules/*`), achieving microservice-like decoupling while preserving monolithic development simplicity.

### Layer Separation
1. **Routes Layer (`*.routes.js`)**: Configures URL schemas, parses middlewares (auth & validation). Mounts isolated logic onto Express.
2. **Controller Layer (`*.controller.js`)**: Intercepts HTTP request definitions (Payload extraction, Context, URL parameters) and bridges payloads into Services. Contains the `try/catch` wrapper pushing to error handlers.
3. **Service Layer (`*.service.js`)**: Exclusively handles Business Rules and PostgreSQL manipulations. Decoupled from HTTP context entirely.
4. **Data Access**: Processed natively through Prisma 7 using the PostgreSQL Driver Adapter safely.

---

## 🗄 Database Design (Prisma 7.7.0)

The overarching schema binds Location data tightly against Gamification logic:

- **Users**: Extended tracking for JWT tracking, specific wallet data (`points`, `coins`), and reputation.
- **Locations**: The fundamental Object. Monitored strictly with `LocationStatus` enum (`PENDING`, `APPROVED`, `REJECTED`).
- **Verifications**: Cross-reference junction. Unique constraint `@@unique([userId, locationId])` limits abuse spamming.
- **ActivityLogs**: Financial audit system mapping any incoming `GAMIFIED` reward into historical ledgers (e.g., `LOCATION_CREATED`, `MISSION_COMPLETED`).
- **BlacklistedTokens**: Supports robust stateless logout logic using time-bound DB matching.
- **Missions & UserMissions**: Links administrative goal objects securely against user time-tracking completion models.
- **Quizzes & UserQuizzes**: Binds geographic location IDs against dynamic trivia prompts. Restricts multi-farming loops.
- **SavedRoutes**: Handles offline sync dependencies storing routing paths (`waypoints` JSON data type utilized).

---

## 🛡 Security Implementations

1. **Authentication (Stateless)**
   - Signatures checked centrally via `auth.middleware.js`. Rejects revoked identifiers mapped into `BlacklistedToken`.
   - **RBAC**: Middleware `role.middleware.js` filters actions uniquely (Admin endpoints locked specifically out of reach).
2. **Input Validation**
   - Joi Schema validation wrapper intercepts incorrect models mapping exactly to what the business rules govern BEFORE any code executes.
3. **App-Wide Safety**
   - **Rate Limiting**: Globally set to 100 requests per IP in a 15-minute sliding window via `express-rate-limit`.
   - **Helmet Headers**: Extended policies safely permitting Static Express files rendering (Allow-CrossOrigin images payloading Local disk Buffers).

---

## 💰 Gamification Engine

The custom `gamificationService` abstracts rewards efficiently. It utilizes **Prisma Transactions (`prisma.$transaction`)** as a proxy wrapper. This strictly ensures that, for instance, a Mission Completion and its ensuing 100-Point reward are completely Atomic; if the reward fails, the mission resets natively.

**Rewards Configured:**
- Create Location → `+20 points`, `+10 coins`
- Verify Location Manually → `+5 points`, `+2 coins`
- Answer Location Quiz Correctly → Variable (`quiz.points`, `quiz.coins`)
- Complete Directed Mission → Variable (`mission.points`, `mission.coins`)
- Trigger AI Auto-Verify → `+10 points`, `+5 coins` (Voter bonus when validated natively by AI).

---

## 🤖 AI Integrations (Google GenAI)

This monolithic layer harnesses Google's Gemini Models strictly utilizing `@google/genai`:

1. **Search (RAG)** (`gemini-2.5-flash`):
   - Ingests user natural language inputs and cross-compiles string concatenations of all `APPROVED` locations inside Postgres.
   - Refuses hallucination securely strictly mapping only existing data bounds.
2. **AI Vision Verification** (`gemini-2.5-flash`):
   - Intercepts Location `imageUrls`. Recursively maps the image's filename into a raw NodeJS file buffer and base64 encodes it locally.
   - Injects Vision payload alongside context params (`name`, `description`). Uses structured JSON querying limits mapping cleanly straight into backend DB conditional hooks mapping `APPROVED` or `REJECTED` natively without Human intervention.

---

## 🛠 Adding a New Feature (Maintenance)

Whenever a new backend feature is required:
1. Create directory `src/modules/{featureName}`.
2. Form your Database schema updates inside `prisma/schema.prisma`.
3. Auto-sync via `npx prisma db push`.
4. Compose `validation.js` -> `service.js` -> `controller.js` -> `routes.js`.
5. Expose inside `src/app.js` using `app.use()`.
