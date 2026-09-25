'use strict';

// * work_logs.hours was a Postgres INTERVAL fed by a free-form string built
// on the frontend (e.g. "5 hours"), even though the Sequelize model declared
// it as STRING. That relied entirely on Postgres's lenient interval parser
// and required fragile multi-format parsing wherever hours were summed
// (see dashboardService.js / userService.js). This migration switches it to
// a plain decimal number of hours, which is what it always represented.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE work_logs
      ALTER COLUMN hours TYPE NUMERIC(6,2)
      USING ROUND(EXTRACT(EPOCH FROM hours::interval)::numeric / 3600, 2)
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE work_logs
      ALTER COLUMN hours TYPE INTERVAL
      USING (hours::text || ' hours')::interval
    `);
  },
};
