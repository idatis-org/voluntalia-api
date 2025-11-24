require('dotenv').config();

/**
 * Settings required to connect to Sequelizer.
 * At present, all settings point to the same configuration.
 */
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: { ssl: { rejectUnauthorized: false } },
  },
};
