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

    const user = await userService.updateUser(id, updateData);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(err);
  }
};
