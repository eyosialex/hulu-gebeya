require('dotenv').config();
// Use existing client to ensure adapter-pg is handled correctly
const prisma = require('../src/prisma/client');

async function main() {
  console.log('Seeding shop items...');

  const shopItems = [
    {
      name: "2x XP Booster",
      description: "Double XP on every verified mission for 24h.",
      price: 300,
      type: "Booster",
      detail: "Stacks with streak bonus",
      tint: "from-amber-500/30 to-orange-700/20"
    },
    {
      name: "Search Radar",
      description: "Reveals nearby Hidden Gem pins within 2km radius.",
      price: 450,
      type: "Booster",
      detail: "5 uses · Lasts 30 min each",
      tint: "from-primary/30 to-cyan-700/20"
    },
    {
      name: "Streak Shield",
      description: "Protects your daily streak for one missed day.",
      price: 250,
      type: "Booster",
      detail: "1 charge",
      tint: "from-emerald-500/30 to-teal-700/20"
    },
    {
      name: "10% off Cafe Lumière",
      description: "Sip + scroll at the city's quietest brew bar.",
      price: 150,
      type: "Coupon",
      detail: "Valid 30 days",
      tint: "from-rose-500/30 to-pink-700/20"
    }
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { id: item.id || '' }, // Using upsert by name mapping if needed, but here we just create or skip
      update: {},
      create: item,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
