const { UserPreference } = require('../models');

const EDITABLE_FIELDS = [
  'email_notifications',
  'push_notifications',
  'sms_notifications',
  'event_notifications',
  'update_notifications',
  'language',
  'timezone',
  'date_format',
];

// * Fetch a user's preferences, creating a default row on first access
exports.getByUserId = async (userId) => {
  const [preferences] = await UserPreference.findOrCreate({
    where: { user_id: userId },
  });
  return preferences;
};

// * Update a user's preferences (creates the row if it doesn't exist yet)
exports.updateByUserId = async (userId, data) => {
  const [preferences] = await UserPreference.findOrCreate({
    where: { user_id: userId },
  });

  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  await preferences.update(updates);
  return preferences;
};
