const missionService = require('./mission.service');
const prisma = require('../../prisma/client');

const getAllMissions = async (req, res, next) => {
  try {
    const missions = await missionService.getAllMissions();
    res.json(missions);
  } catch (error) {
    next(error);
  }
};

const getMissionLog = async (req, res, next) => {
  try {
    // Fetch all locations to show progress
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const approvedCount = locations.filter(l => l.status === 'APPROVED').length;
    const pendingCount = locations.filter(l => l.status === 'PENDING').length;

    const missionLog = locations.map(loc => ({
      id: loc.id.slice(0, 8).toUpperCase(), // Short ID for UI
      dbId: loc.id,
      name: loc.name,
      cat: loc.category,
      status: loc.status,
      when: new Date(loc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: loc.status === 'APPROVED' ? 150 : 50,
      coins: loc.status === 'APPROVED' ? 100 : 20,
      ai: loc.verificationScore || (loc.status === 'APPROVED' ? 95 : 45),
      gps: `${loc.latitude.toFixed(4)} N, ${loc.longitude.toFixed(4)} E`,
      lat: loc.latitude,
      lng: loc.longitude,
      tip: loc.description || (loc.status === 'APPROVED' ? "Verified spot!" : "Waiting for AI verification..."),
      tags: [loc.status],
      photo: loc.imageUrl || "from-slate-500/30 to-zinc-700/20"
    }));

    res.json({
      missions: missionLog,
      stats: {
        totalVerified: approvedCount,
        totalPending: pendingCount,
        weeklyGoal: 10,
        avgTrust: locations.length > 0 ? (locations.reduce((acc, l) => acc + (l.verificationScore || 0), 0) / locations.length).toFixed(1) : "0"
      }
    });
  } catch (error) {
    next(error);
  }
};

const createMission = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const mission = await missionService.createMission(req.body, adminId);
    
    res.status(201).json({
      message: 'Mission created successfully',
      mission
    });
  } catch (error) {
    next(error);
  }
};

const startMission = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const userMission = await missionService.startMission(id, userId);

    res.status(201).json({
      message: 'Mission started',
      userMission
    });
  } catch (error) {
    next(error);
  }
};

const completeMission = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { userLat, userLng, isSimulator } = req.body;

    const userMission = await missionService.completeMission(id, userId, userLat, userLng, isSimulator);

    res.json({
      message: 'Mission completed successfully',
      userMission
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendedMission = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const userId = req.user.userId;

    // 1. Fetch PENDING locations from Neon Database
    const pendingLocations = await prisma.location.findMany({
      where: { status: 'PENDING' },
      take: 20
    });

    if (pendingLocations.length === 0) {
      return res.json({ message: "All local spots are verified! Good job explorer." });
    }

    const mappedLocations = pendingLocations.map(loc => ({
      id: loc.id,
      name: loc.name,
      category: loc.category,
      lat: loc.latitude,
      lng: loc.longitude,
      image_url: loc.imageUrl
    }));

    // 2. Ask ML Engine to pick the best mission
    const mlResponse = await fetch(`http://localhost:5001/mission/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lat: parseFloat(lat) || 0, 
        lng: parseFloat(lng) || 0, 
        locations_list: mappedLocations 
      })
    });

    const recommendation = await mlResponse.json();
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    // 1. Fetch nearby locations (within 3km) using raw SQL for distance
    const userLat = parseFloat(lat) || 0;
    const userLng = parseFloat(lng) || 0;

    const userId = req.user.userId;
    let locations = await prisma.$queryRaw`
      SELECT * FROM "Location"
      WHERE "createdById" != ${userId}
      AND (
        6371 * acos(
          least(1.0, greatest(-1.0, 
            cos(radians(${userLat})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${userLng})) +
            sin(radians(${userLat})) * sin(radians(latitude))
          ))
        )
      ) <= 3
      ORDER BY CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END, "createdAt" DESC
      LIMIT 30
    `;

    console.log(`[QUIZ] Found ${locations.length} external locations within 3km`);

    if (locations.length < 1) {
      console.log(`[QUIZ] No local spots. Expanding search globally (excluding self)...`);
      locations = await prisma.$queryRaw`
        SELECT * FROM "Location"
        WHERE "createdById" != ${userId}
        ORDER BY CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END, (
          6371 * acos(
            least(1.0, greatest(-1.0, 
              cos(radians(${userLat})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${userLng})) +
              sin(radians(${userLat})) * sin(radians(latitude))
            ))
          )
        ) ASC
        LIMIT 30
      `;
    }

    if (locations.length < 1) {
      return res.json({ error: "No locations available for verification. This usually happens if you are the only one adding places! Ask a friend to add some spots for you to verify." });
    }

    // 2. Map database fields to the format expected by the Python ML engine
    const mappedLocations = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      category: loc.category,
      lat: loc.latitude,
      lng: loc.longitude,
      image_url: loc.imageUrl
    }));

    // 3. Randomize quiz mode for a better experience
    const randomMode = Math.random() > 0.5 ? 'choice' : 'binary';

    // 4. Ask ML Engine to generate a quiz
    const mlResponse = await fetch(`http://localhost:5001/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lat: parseFloat(lat) || 0, 
        lng: parseFloat(lng) || 0, 
        locations_list: mappedLocations,
        mode: randomMode
      })
    });

    const quiz = await mlResponse.json();
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

const getPersonaChat = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    // 1. Fetch nearby locations to give context to the Robot
    const locations = await prisma.location.findMany({
      take: 10
    });

    const mappedLocations = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      category: loc.category,
      lat: loc.latitude,
      lng: loc.longitude,
      image_url: loc.imageUrl
    }));

    // 2. Ask ML Engine for persona dialogue
    const mlResponse = await fetch(`http://localhost:5001/mission/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lat: parseFloat(lat) || 0, 
        lng: parseFloat(lng) || 0, 
        locations_list: mappedLocations 
      })
    });

    const chat = await mlResponse.json();
    res.json(chat);
  } catch (error) {
    next(error);
  }
};


const submitQuizAnswer = async (req, res, next) => {
  try {
    const { location_id, is_correct } = req.body;
    const userId = req.user.userId;

    // Forward to ML engine for weighted scoring
    const mlResponse = await fetch(`http://localhost:5001/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location_id,
        is_correct,
        user_id: userId
      })
    });

    const result = await mlResponse.json();

    // If correct, increment location's trust score in DB
    if (is_correct && result.confirmation_added) {
      await prisma.location.update({
        where: { id: location_id },
        data: {
          verificationScore: {
            increment: result.confirmation_added * 10 // Scale to 0-100 range
          }
        }
      }).catch(() => {}); // Silently fail if location id doesn't match
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMissions,
  getMissionLog,
  getRecommendedMission,
  getQuiz,
  submitQuizAnswer,
  getPersonaChat,
  createMission,
  startMission,
  completeMission
};
