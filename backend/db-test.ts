import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function testConnection() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    
    // Test query (make sure db push was run first)
    const userCount = await prisma.user.count();
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Total Users in DB: ${userCount}`);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    // Also close the pool to exit the process
    await pool.end();
  }
}

// Check if run directly
const isMain = import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) || process.argv[1].endsWith('db-test.ts');

if (isMain) {
  testConnection();
}

export default prisma;
