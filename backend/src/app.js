const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./modules/auth/auth.routes');
const locationRoutes = require('./modules/location/location.routes');
const verificationRoutes = require('./modules/verification/verification.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');
const gamificationRoutes = require('./modules/gamification/gamification.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const missionRoutes = require('./modules/mission/mission.routes');
const quizRoutes = require('./modules/quiz/quiz.routes');
const navigationRoutes = require('./modules/navigation/navigation.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const searchRoutes = require('./modules/search/search.routes');
const aiVerificationRoutes = require('./modules/ai_verification/ai_verification.routes');
const shopRoutes = require('./modules/shop/shop.routes');
const socialRoutes = require('./modules/social/social.routes');
const userRoutes = require('./modules/user/user.routes');
const path = require('path');

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving static images safely
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.send('SmartMap API running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/locations', verificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/users', userRoutes);
app.use('/api', aiVerificationRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;