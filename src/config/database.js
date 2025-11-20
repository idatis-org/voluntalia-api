// require('dotenv').config();

// /**
//  * Settings required to connect to Sequelizer. 
//  * At present, all settings point to the same configuration.
//  */
// module.exports = {
//   development: {
//     url: process.env.DATABASE_URL,
//     dialect: 'postgres',
//   },
//   test: {
//     url: process.env.DATABASE_URL,
//     dialect: 'postgres',
//   },
//   production: {
//     url: process.env.DATABASE_URL,
//     dialect: 'postgres',
//     dialectOptions: { ssl: { rejectUnauthorized: false } },
//   },
// };

require('dotenv').config();
const baseConfig = {
  dialect: 'postgres',
  protocol: 'tcp',
  dialectOptions: {
    // deshabilita SSL en local
    ssl: false,
  },
  // Fuerza IPv4
  host: 'db',
  port: 5432,
  // Retry agresivo
  retry: {
    max: 15,
    backoffBase: 1000,
    backoffExponent: 1.2,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: console.log,
};

module.exports = {
  development: { url: process.env.DATABASE_URL, ...baseConfig },
  test:       { url: process.env.DATABASE_URL, ...baseConfig },
  production: { url: process.env.DATABASE_URL, ...baseConfig },
};