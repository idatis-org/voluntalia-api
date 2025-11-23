const userService = require('../services/userService');

// * Fetch list of all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(201).json({ users });
  } catch (err) {
    next(err);
  }
};
