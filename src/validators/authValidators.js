const { z } = require('zod');
const roles = require('../constants/roles');

const ALLOWED_REGISTER_ROLES = [roles.COORDINATOR, roles.VOLUNTEER, roles.LEGAL];

exports.registerSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  role: z.enum(ALLOWED_REGISTER_ROLES).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

exports.loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(1, 'password is required'),
});
