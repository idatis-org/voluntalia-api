'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status enum column if it doesn't exist
    try {
      await queryInterface.addColumn('projects', 'status', {
        type: Sequelize.ENUM('planned','active','completed','cancelled'),
        allowNull: false,
        defaultValue: 'planned',
      });
    } catch (error) {
      // Column might already exist
      console.log('Status column already exists or error:', error.message);
    }

    // Make manager_id nullable using raw SQL for better PostgreSQL compatibility
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE projects 
        ALTER COLUMN manager_id DROP NOT NULL;
      `);
    } catch (error) {
      console.log('Error altering manager_id:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert manager_id to NOT NULL
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE projects 
        ALTER COLUMN manager_id SET NOT NULL;
      `);
    } catch (error) {
      console.log('Error reverting manager_id:', error.message);
    }

    // Remove status column
    try {
      await queryInterface.removeColumn('projects', 'status');
    } catch (error) {
      console.log('Error removing status column:', error.message);
    }
  }
};
