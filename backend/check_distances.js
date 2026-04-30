require('dotenv').config();
const prisma = require('./src/prisma/client');
async function main() {
  const userLat = 8.9806;
  const userLng = 38.7578;
  
  console.log(`Checking locations near ${userLat}, ${userLng}...`);

  const allLocations = await prisma.location.findMany();
  console.log(`Total locations in DB: ${allLocations.length}`);
  
  allLocations.forEach(loc => {
    // Simple Pythagorean distance approximation in degrees
    const latDiff = loc.latitude - userLat;
    const lngDiff = loc.longitude - userLng;
    const distDeg = Math.sqrt(latDiff*latDiff + lngDiff*lngDiff);
    // Rough conversion to km: 1 degree approx 111 km
    const distKm = distDeg * 111;
    console.log(`- ${loc.name}: lat=${loc.latitude}, lng=${loc.longitude}, distance=~${distKm.toFixed(2)}km`);
  });

  const queryRawLocs = await prisma.$queryRaw`
    SELECT id, name, latitude, longitude,
      (6371 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(${userLat})) * cos(radians("latitude")) *
          cos(radians("longitude") - radians(${userLng})) +
          sin(radians(${userLat})) * sin(radians("latitude"))
        ))
      )) as distance_km
    FROM "Location"
    ORDER BY distance_km ASC
    LIMIT 30
  `;
  
  console.log('\nSending to ML engine...');
  const mlResponse = await fetch('http://localhost:5001/quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      lat: userLat, 
      lng: userLng, 
      locations_list: queryRawLocs,
      mode: 'choice'
    })
  });
  
  if (!mlResponse.ok) {
    const text = await mlResponse.text();
    console.error(`ML ENGINE ERROR (${mlResponse.status}):`, text);
  } else {
    console.log('ML ENGINE SUCCESS:', await mlResponse.json());
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
