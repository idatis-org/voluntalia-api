'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find an existing user to set as manager/creator for the default project
    const [[userRow]] = await queryInterface.sequelize.query("SELECT id FROM users LIMIT 1;");
    if (!userRow || !userRow.id) {
      throw new Error('No users found in users table. Create a user before running this migration.');
    }
    const userId = userRow.id;

    // Insert a default project and get its id
    const insertSql = `INSERT INTO projects (id, name, description, manager_id, created_by, created_at, updated_at)
      VALUES (uuid_generate_v4(), 'Default Project', 'Assigned by migration', '${userId}', '${userId}', NOW(), NOW()) RETURNING id;`;

    const [insertResult] = await queryInterface.sequelize.query(insertSql);
    const defaultProjectId = insertResult[0].id;

    // Assign default project to activities without project
    await queryInterface.sequelize.query(`UPDATE activities SET project_id='${defaultProjectId}' WHERE project_id IS NULL;`);

    // Change column to NOT NULL and set referential action to RESTRICT to avoid nulls on delete
    await queryInterface.changeColumn('activities', 'project_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'projects', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Find the default project we created
    const [[projRow]] = await queryInterface.sequelize.query("SELECT id FROM projects WHERE name = 'Default Project' AND description = 'Assigned by migration' LIMIT 1;");
    if (projRow && projRow.id) {
      const projId = projRow.id;
      // Set activities that reference it back to NULL
      await queryInterface.sequelize.query(`UPDATE activities SET project_id = NULL WHERE project_id = '${projId}';`);
      // Delete the default project
      await queryInterface.sequelize.query(`DELETE FROM projects WHERE id = '${projId}';`);
    }

    // Revert column to allowNull: true and previous onDelete behavior
    await queryInterface.changeColumn('activities', 'project_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'projects', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};
