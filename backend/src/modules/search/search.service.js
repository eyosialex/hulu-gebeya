const prisma = require('../../prisma/client');
const { GoogleGenAI } = require('@google/genai');
const { calculateDistance } = require('../../utils/geo');

// ─────────────────────────────────────────────────────────────
// Helper: fetch nearby approved locations from real database
// ─────────────────────────────────────────────────────────────
const getNearbyFromDB = async (userLat, userLng) => {
  const all = await prisma.location.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true, category: true, description: true, latitude: true, longitude: true, imageUrl: true }
  });

  return all
    .map(loc => ({
      ...loc,
      lat: loc.latitude,
      lng: loc.longitude,
      distance: calculateDistance(userLat, userLng, loc.latitude, loc.longitude)
    }))
    .filter(loc => loc.distance <= 10000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15);
};

// ─────────────────────────────────────────────────────────────
// ENGINE 1: SmartMap DB Search (Node.js + Gemini)
// Fast, uses only YOUR real verified locations
// ─────────────────────────────────────────────────────────────
const dbSearch = async (query, userLat, userLng) => {
  const nearby = await getNearbyFromDB(userLat, userLng);

  if (nearby.length === 0) {
    return {
      engine: 'SmartMap DB',
      answer: "No verified SmartMap locations found near you yet. Be the first to add one!",
      results: [],
      confidence: 0
    };
  }

  const contextStr = nearby
    .map((l, i) => `[${i + 1}] ${l.name} (${l.category}) — ${Math.round(l.distance)}m away. ${l.description || ''}`)
    .join('\n');

  const prompt = `You are SmartMap AI, a local city guide. Answer in 2 sentences max. Only mention places from the list below.
Nearby verified locations:
${contextStr}
User asks: ${query}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return {
      engine: 'SmartMap DB',
      answer: response.text().trim(),
      results: nearby.slice(0, 5).map(l => ({
        name: l.name,
        category: l.category,
        distance: Math.round(l.distance),
        imageUrl: l.imageUrl
      })),
      confidence: 0.85
    };
  } catch (e) {
    const top = nearby[0];
    return {
      engine: 'SmartMap DB',
      answer: `Best match in your area: ${top.name} (${Math.round(top.distance)}m away).`,
      results: nearby.slice(0, 5).map(l => ({ name: l.name, category: l.category, distance: Math.round(l.distance) })),
      confidence: 0.5
    };
  }
};

// ─────────────────────────────────────────────────────────────
// ENGINE 2: Global RAG Search (Python ML Engine)
// Slower, searches OSM + Overpass + DB with 10 AI upgrades
// ─────────────────────────────────────────────────────────────
const ragSearch = async (query, userLat, userLng) => {
  const nearby = await getNearbyFromDB(userLat, userLng);

  const mlResponse = await fetch('http://localhost:5001/rag', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      location: { lat: parseFloat(userLat) || 8.9806, lng: parseFloat(userLng) || 38.7578 },
      fast_mode: false,
      locations_list: nearby
    })
  });

  if (!mlResponse.ok) throw new Error('ML Engine Unreachable');

  const data = await mlResponse.json();

  // Flatten results from all sources
  const allResults = [
    ...(data.sources?.database || []),
    ...(data.sources?.osm || []),
    ...(data.sources?.overpass || [])
  ].slice(0, 5).map(r => ({
    name: r.name,
    category: r.category || 'location',
    distance: r.distance ? Math.round(r.distance * 1000) : null,
    trustScore: r.trust_score,
    source: r.source,
    osmUrl: r.osm_url
  }));

  return {
    engine: 'Global RAG',
    answer: data.answer,
    results: allResults,
    confidence: data.confidence,
    intent: data.intent
  };
};

// ─────────────────────────────────────────────────────────────
// UNIFIED: Run both engines in parallel
// ─────────────────────────────────────────────────────────────
const unifiedSearch = async (query, userLat, userLng) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  const [dbResult, ragResult] = await Promise.allSettled([
    dbSearch(query, userLat, userLng),
    ragSearch(query, userLat, userLng)
  ]);

  return {
    query,
    smartmap: dbResult.status === 'fulfilled' ? dbResult.value : {
      engine: 'SmartMap DB',
      answer: 'SmartMap search unavailable.',
      results: [],
      confidence: 0
    },
    global: ragResult.status === 'fulfilled' ? ragResult.value : {
      engine: 'Global RAG',
      answer: 'Global AI search unavailable. Make sure the ML Engine is running on Port 5001.',
      results: [],
      confidence: 0
    }
  };
};

module.exports = { ragSearch: unifiedSearch };
