# SmartMap Technical Documentation 📚

## 🏗 System Architecture
The backend follows a **Modular Monolith** architecture. Each feature is self-contained within the `src/modules` directory, promoting maintainability and clear domain boundaries.

### Layer Separation
- **Routes Layer**: Standard Express routing with validation and authentication middlewares.
- **Controller Layer**: Handles HTTP-specific logic (extracting params, status codes).
- **Service Layer**: Contains the core business logic and atomic database transactions.
- **Data Access**: Managed via Prisma Client using the PostgreSQL Driver Adapter.

## 🗄 Database Design (Prisma)
The schema is designed for high relational integrity:
- **User**: Stores points, coins, and reputation.
- **Location**: Tracks the status (`PENDING`, `APPROVED`, `REJECTED`) and community score.
- **Verification**: A junction table with a `@@unique([userId, locationId])` constraint to prevent double-voting.
- **ActivityLog**: A historical record of all point-earning actions for auditing.

## 🛡 Security Implementations
- **Authentication**: JWT-based stateless auth with a 7D expiry. Needs a `JWT_SECRET` env variable.
- **Encryption**: `bcrypt` with a cost factor of 10 for password hashing.
- **Rate Limiting**: `express-rate-limit` prevents brute-force on API endpoints (100 requests per 15 mins).
- **HTTP Security**: `helmet` is configured to set secure headers.
- **Validation**: Strict schema validation using `Joi` on all incoming POST requests.

## 💰 Gamification Logic
Atomic updates are performed using **Prisma Transactions**.
- **Add Location**: +20 Pts, +10 Coins.
- **Verify Location**: +5 Pts, +2 Coins.
- **Community UP Vote**: +0.1 Reputation for creator.

## 📈 Leaderboard Optimization
Leaderboards utilize PostgreSQL aggregation:
- `daily` and `weekly` rankings are computed by summing `points` from `ActivityLog` within a date-filtered window.
- `lifetime` rankings use the pre-computed `User.points` column for instant retrieval.

## 🛠 Maintenance & Development
### Adding a New Module
1. Create directory `src/modules/{feature}`.
2. Define `routes.js`, `controller.js`, `service.js`, and `validation.js`.
3. Mount the routes in `src/app.js`.

### Testing
The system includes a custom `db-test.ts` for rapid database connection verification.
Run with: `npx tsx db-test.ts`
