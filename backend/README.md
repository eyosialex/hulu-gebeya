# SmartMap Backend 📍🎮

SmartMap is a gamified map verification system where users submit real-world locations, verify them through community consensus, and earn points, coins, and reputation.

## 🚀 Teck Stack
- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Prisma (using Driver Adapters)
- **Security**: JWT, Bcrypt, Helmet, Express Rate Limit
- **Validation**: Joi
- **Logging**: Morgan

## ✨ Core Features
- **Modular Architecture**: Clean separation of Auth, Location, Verification, and Leaderboard.
- **Gamification Engine**: Atomic reward system (Points/Coins) with a persistent Activity Log.
- **Community Trust**: Automated verification based on community voting (UP/DOWN).
- **Leaderboards**: Daily, Weekly, and All-time rankings optimized via DB aggregation.
- **Production Ready**: Input validation, security headers, and brute-force protection.

## 🛠 Installation & Setup
1. **Clone the repository.**
2. **Install dependencies**: `npm install`
3. **Configure Environment**: Create a `.env` file from the sample.
4. **Database Init**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Run**: `npm run dev`

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Create a new account (+20 Points, +10 Coins).
- `POST /api/auth/login` - Authenticate and receive a JWT.

### 📍 Locations
- `POST /api/locations` - Submit a location for verification (Auth required).
- `GET /api/locations` - List all locations (Filter by category/status).
- `GET /api/locations/:id` - Detailed view of a specific location.

### 🗳 Verifications
- `POST /api/verifications` - Vote UP or DOWN on a location. 
  - Voter gets +5 Points.
  - Creator gets +0.1 Reputation on UP votes.

### 🏆 Leaderboard
- `GET /api/leaderboard?timeframe=daily` - Top users for the day.
- `GET /api/leaderboard?timeframe=weekly` - Top users for the week.

## 🧪 Testing
Check your database connection effortlessly:
```bash
npx tsx db-test.ts
```

## 📜 License
ISC
