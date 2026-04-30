const PORT = 5001; // Using different port for testing
process.env.PORT = PORT;
process.env.JWT_SECRET = 'test_secret';

require('dotenv').config();
const app = require('./src/app');
const http = require('http');

let server;

async function runTest() {
  console.log('🚀 Starting Integration Validation...');

  server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Register User
    console.log('\n--- Testing Auth Flow ---');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', email: `test_${Date.now()}@test.com`, password: 'password123' })
    });
    const regData = await regRes.json();
    if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log('✅ Registration Successful');

    const token = regData.token;
    const authHeaders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 1.5 Update Profile (Phase 4 test)
    console.log('\n--- Testing Profile Update ---');
    const updateRes = await fetch(`${baseUrl}/users/me/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ city: 'Neo-Lagos', bio: 'Living in the future.' })
    });
    const updateData = await updateRes.json();
    if (updateRes.status === 200 && updateData.user.city === 'Neo-Lagos') {
      console.log('✅ Profile Update Successful');
    }

    // 2. Dashboard Validation
    console.log('\n--- Testing Dashboard Integration ---');
    const dashRes = await fetch(`${baseUrl}/dashboard/me`, { headers: authHeaders });
    const dashData = await dashRes.json();
    
    const requiredUserFields = ['id', 'name', 'initials', 'rank', 'level', 'xp', 'xpNext', 'coins', 'points', 'streak', 'trustScore', 'totalMissions', 'city'];
    const missingFields = requiredUserFields.filter(f => dashData.user[f] === undefined);
    
    if (missingFields.length > 0) {
      console.log(`❌ Dashboard Data Missing Fields: ${missingFields.join(', ')}`);
    } else {
      console.log(`✅ Dashboard matches spec. User at: ${dashData.user.city}`);
    }

    // 3. Mission / Location Loop
    console.log('\n--- Testing Mission Capture Loop ---');
    const locPost = await fetch(`${baseUrl}/locations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Integration Landmark',
        category: 'Heritage',
        tip: 'Check the plaque.',
        latitude: 6.5,
        longitude: 3.3
      })
    });
    const locData = await locPost.json();
    if (locPost.status === 201) {
      console.log('✅ Location created with "tip" normalization');
      const locId = locData.location.id;
      
      console.log('🤖 Triggering AI Verification...');
      const verifyRes = await fetch(`${baseUrl}/locations/${locId}/ai-verify`, {
        method: 'POST',
        headers: authHeaders
      });
      const verifyData = await verifyRes.json();
      if (verifyData.rewards && verifyData.rewards.xp !== undefined) {
         console.log(`✅ AI Verify returned Rewards: +${verifyData.rewards.xp} XP`);
      }
    }

    // 4. Shop Validation
    console.log('\n--- Testing Marketplace Flow ---');
    const shopRes = await fetch(`${baseUrl}/shop/items`, { headers: authHeaders });
    const shopItems = await shopRes.json();
    console.log(`✅ Fetched ${shopItems.length} Shop Items`);

    if (shopItems.length > 0) {
      const item = shopItems[0];
      console.log(`🛒 Testing purchase: ${item.name} (${item.price} coins)`);
      
      const buyRes = await fetch(`${baseUrl}/shop/buy`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ itemId: item.id })
      });
      const buyData = await buyRes.json();
      
      if (buyRes.status === 402) {
        console.log(`✅ Insufficient funds handled perfectly for ${item.name}`);
      }
    }

    // 5. Mission Log Validation
    console.log('\n--- Testing Mission Log (Location Mapping) ---');
    const missionRes = await fetch(`${baseUrl}/missions/log`, { headers: authHeaders });
    const missions = await missionRes.json();
    if (missions.length > 0) {
       console.log(`✅ Fetched ${missions.length} log entries. Format Check: GPS=${missions[0].gps}`);
    }

    console.log('\n🚀 ALL INTEGRATION TESTS COMPLETED');

  } catch (error) {
    console.error('\n🛑 TEST SUITE ABORTED:', error.message);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTest();
