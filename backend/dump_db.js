require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function dump() {
  const locations = await prisma.location.findMany({
    select: {
      name: true,
      category: true,
      latitude: true,
      longitude: true,
      status: true
    }
  });
  console.log(JSON.stringify(locations, null, 2));
}

dump().catch(console.error).finally(() => prisma.$disconnect());
