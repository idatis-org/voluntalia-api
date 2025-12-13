'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add enum value if not present. Runs outside transaction.
    await queryInterface.sequelize.query(
      `DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'PROJECT_MANAGER'
          ) THEN
            ALTER TYPE enum_users_role ADD VALUE 'PROJECT_MANAGER';
          END IF;
        END$$;`,
      { transaction: false }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Removing enum values in Postgres is non-trivial; skip for dev.
    return Promise.resolve();
  }
};
