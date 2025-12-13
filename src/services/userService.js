const { User, Activity, WorkLog, RefreshToken } = require('../models');

// * Retrieve up to 100 newest users with their activity relations
exports.getAllUsers = async () => {
  const users = await User.findAll({
    // ? Only expose safe, necessary fields
    attributes: [
      'id',
      'name',
      'email',
      'role',
      'is_active',
      'created_at',
      'phone',
      'country',
      'city',
    ],
    // ! Order by newest first to keep recent sign-ups on top
    order: [['created_at', 'DESC']],
    limit: 100,

    include: [
      {
        model: Activity,
        as: 'createdActivities',
        attributes: ['id', 'title', 'description', 'date'],
      },
      {
        model: Activity,
        as: 'volunteerActivities',
        attributes: ['id', 'title', 'description', 'date'],
        through: { attributes: [] }, // * Exclude junction table fields
      },
      {
        model: WorkLog,
        as: 'workLogs',
        attributes: ['hours'],
      },
    ],
  });

  // Add totalWorkHours field for each user
  return users.map((user) => {
    const totalWorkHours = user.workLogs.reduce((sum, wl) => {
      const h =
        wl.hours && typeof wl.hours.hours === 'number' ? wl.hours.hours : 0;
      const m =
        wl.hours && typeof wl.hours.minutes === 'number' ? wl.hours.minutes : 0;
      return sum + h + m / 60;
    }, 0);
    return {
      ...user.toJSON(),
      totalWorkHours,
    };
  });
};

// * Update user by ID
exports.updateUser = async (id, updateData, actor = {}) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Update allowed fields by default
  const allowedFields = ['name', 'phone', 'country', 'city'];
  const dataToUpdate = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      dataToUpdate[field] = updateData[field];
    }
  });

  // Role change: only COORDINATOR may change role
  if (updateData.role !== undefined && updateData.role !== user.role) {
    if (actor.role !== 'COORDINATOR') {
      throw new Error('Forbidden: only coordinators may change roles');
    }

    // Validate requested role
    const allowedRoles = ['COORDINATOR', 'PROJECT_MANAGER', 'VOLUNTEER', 'LEGAL'];
    if (!allowedRoles.includes(updateData.role)) {
      throw new Error('Invalid role');
    }

    dataToUpdate.role = updateData.role;

    // When promoting to PROJECT_MANAGER, require activation step: deactivate user until they set password
    if (updateData.role === 'PROJECT_MANAGER') {
      dataToUpdate.is_active = false;

      // Revoke existing refresh tokens for safety
      await RefreshToken.destroy({ where: { user_id: user.id } });
    }
  }

  await user.update(dataToUpdate);

  return user;
};

// * Toggle user active status
exports.toggleUserStatus = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Toggle is_active status (deactivate if active, activate if inactive)
  await user.update({ is_active: !user.is_active });

  return user;
};
