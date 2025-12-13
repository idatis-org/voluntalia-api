const userService = require("../services/userService");

// * Fetch list of all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(201).json({ users });
  } catch (err) {
    next(err);
  }
};

// * Update user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const actor = { id: req.user.sub, role: req.user.role };
    const user = await userService.updateUser(id, updateData, actor);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (err.message && err.message.startsWith('Forbidden')) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next(err);
  }
};

// * Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.toggleUserStatus(id);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(err);
  }
};
