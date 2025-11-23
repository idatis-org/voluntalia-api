'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      name: { type: Sequelize.TEXT, allowNull: false },
      email: { type: Sequelize.TEXT, allowNull: false, unique: true },
      password_hash: { type: Sequelize.TEXT, allowNull: false },
      role: {
        type: Sequelize.ENUM('COORDINATOR', 'VOLUNTEER', 'LEGAL'),
        allowNull: false,
        defaultValue: 'VOLUNTEER',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Índices
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);

    // Trigger
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END; $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_users_role;'
    );
  },
};
