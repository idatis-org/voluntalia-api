const { User, RefreshToken, Activity } = require('../models');
const bcrypt = require('bcrypt');
const { VOLUNTEER } = require('../constants/roles');
const {
  ConflictError,
  CredentialError,
  NotFoundError,
} = require('../errors/errorTypes');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const SALT_ROUNDS = 10;

// * Register a new user with hashed password
exports.register = async ({
  name,
  email,
  password,
  role = VOLUNTEER,
  country,
  city,
}) => {
  // ! Check for duplicate email
  const existing = await User.findOne({ where: { email } });
  console.log(existing);
  if (existing) throw new ConflictError('Email already registered');

  // * Hash password before storage
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password_hash,
    role,
    country,
    city,
  });

  // ? Return only safe fields
  const { id, created_at } = user;
  return { id, name, email, role, created_at };
};

// * Validate email/password and return user
exports.checkCredentials = async (email, password) => {
  // ? Fetch active user only
  const user = await User.findOne({ where: { email, is_active: true } });
  if (!user) throw new CredentialError('Invalid credentials');

  // ! Compare provided password with stored hash
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new CredentialError('Invalid credentials');
  return user;
};

// * Issue new access & refresh tokens for user
exports.createToken = async (user) => {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  const refreshToken = signRefreshToken({ sub: user.id });

  // ! Persist refresh token in DB
  await RefreshToken.create({
    token: refreshToken,
    user_id: user.id,
  });

  return { accessToken, refreshToken };
};

// * Exchange refresh token for new access token
exports.refresh = async (refreshToken) => {
  // ! Verify token exists and is not revoked
  const token = await RefreshToken.findOne({
    where: { token: refreshToken },
  });
  if (!token) throw new NotFoundError('Invalid refresh token');

  // ? Decode and validate refresh token payload
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findOne({
    where: { id: payload.sub },
  });
  if (!user) throw new NotFoundError('User not found');

  // * Return fresh access token
  return signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
};

// * Revoke refresh token on logout
exports.logout = async (refreshToken) => {
  await RefreshToken.update(
    { revoked: true },
    { where: { token: refreshToken } }
  );
};

// * Fetch current user profile with volunteer activities
exports.getCurrentUser = async (id) => {
  return await User.findOne({
    where: { id },
    include: [
      {
        model: Activity,
        as: 'volunteerActivities',
        attributes: ['id', 'title', 'description', 'date'],
        through: { attributes: [] }, // * Exclude junction table fields
      },
    ],
  });
};
