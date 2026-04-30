require('dotenv').config();

module.exports = {
  // Minimal config to satisfy the CLI
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
