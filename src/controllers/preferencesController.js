const preferencesService = require('../services/preferencesService');

// * Fetch the authenticated user's preferences
exports.getMine = async (req, res, next) => {
  try {
    const preferences = await preferencesService.getByUserId(req.user.sub);
    res.status(200).json({ preferences });
  } catch (err) {
    next(err);
  }
};

// * Update the authenticated user's preferences
exports.updateMine = async (req, res, next) => {
  try {
    const preferences = await preferencesService.updateByUserId(req.user.sub, req.body);
    res.status(200).json({ preferences });
  } catch (err) {
    next(err);
  }
};
