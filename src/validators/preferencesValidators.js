const { z } = require('zod');

// * All fields optional: PUT accepts a partial update.
exports.updatePreferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  event_notifications: z.boolean().optional(),
  update_notifications: z.boolean().optional(),
  language: z.string().trim().min(1).max(10).optional(),
  timezone: z.string().trim().min(1).max(50).optional(),
  date_format: z.string().trim().min(1).max(20).optional(),
});
