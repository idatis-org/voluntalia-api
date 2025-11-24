const { Pool } = require('pg');
require('dotenv').config();

/**
 * Connection to access PostgreSQL if you dont want to use Sequelize
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: false
});

pool.on('error', (err) => {
  console.error('PG Pool error:', err);
  process.exit(-1);
});

module.exports = { pool };
