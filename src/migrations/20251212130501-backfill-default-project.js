'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // find a coordinator or any user to be manager/creator
      let managerRes = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE role = 'COORDINATOR' LIMIT 1",
        { transaction }
      );
      let manager_id = managerRes[0] && managerRes[0][0] ? managerRes[0][0].id : null;

      if (!manager_id) {
        // fallback to any user
        let anyRes = await queryInterface.sequelize.query(
          'SELECT id FROM users LIMIT 1',
          { transaction }
        );
        manager_id = anyRes[0] && anyRes[0][0] ? anyRes[0][0].id : null;
      }

      if (!manager_id) {
        // If no users exist, create a dummy user placeholder (not ideal but prevents failures)
        const insertUserRes = await queryInterface.sequelize.query(
          "INSERT INTO users (id, name, email, role, created_at) VALUES (uuid_generate_v4(), 'legacy-manager', 'legacy@example.com', 'COORDINATOR', NOW()) RETURNING id",
          { transaction }
        );
        manager_id = insertUserRes[0] && insertUserRes[0][0] ? insertUserRes[0][0].id : null;
      }

      // Create default project
      const insertProjectRes = await queryInterface.sequelize.query(
        `INSERT INTO projects (id, name, description, manager_id, created_by, start_date, end_date, created_at, updated_at)
         VALUES (uuid_generate_v4(), 'Legacy Activities', 'Default project assigned during migration', :manager_id, :created_by, NULL, NULL, NOW(), NOW())
         RETURNING id`,
        { replacements: { manager_id, created_by: manager_id }, transaction }
      );

      const projectId = insertProjectRes[0] && insertProjectRes[0][0] ? insertProjectRes[0][0].id : null;

      if (projectId) {
        // Assign any activities with NULL project_id to this project
        await queryInterface.sequelize.query(
          'UPDATE activities SET project_id = :projectId WHERE project_id IS NULL',
          { replacements: { projectId }, transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // find the legacy project
      const res = await queryInterface.sequelize.query(
        "SELECT id FROM projects WHERE name = 'Legacy Activities' LIMIT 1",
        { transaction }
      );
      const projectId = res[0] && res[0][0] ? res[0][0].id : null;

      if (projectId) {
        // Unassign activities that point to this project
        await queryInterface.sequelize.query(
          'UPDATE activities SET project_id = NULL WHERE project_id = :projectId',
          { replacements: { projectId }, transaction }
        );
        // Remove the legacy project
        await queryInterface.sequelize.query(
          'DELETE FROM projects WHERE id = :projectId',
          { replacements: { projectId }, transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
