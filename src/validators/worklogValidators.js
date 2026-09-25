const { z } = require('zod');

const activitySchema = z
  .object({ id: z.string() })
  .nullable()
  .optional();

const baseWorklogSchema = {
  week_start: z.string().trim().min(1, 'week_start is required'),
  hours: z
    .number('hours must be a number')
    .positive('hours must be greater than 0')
    .max(168, 'a single entry cannot exceed 168 hours'),
  notes: z.string().optional(),
  activity: activitySchema,
};

exports.createWorklogSchema = z.object(baseWorklogSchema);

exports.updateWorklogSchema = z.object(baseWorklogSchema).partial();

exports.updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});
