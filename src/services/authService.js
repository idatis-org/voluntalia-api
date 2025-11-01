const {
  User,
  RefreshToken,
  Activity,
  PasswordResetToken,
} = require('../models');
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
  skills,
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

  if (skills && skills.length) {
    await user.addSkills(skills);
  }

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

// Reset user password
exports.resetPassword = async (userId, newPassword) => {
  const bcrypt = require('bcrypt');
  const { User } = require('../models'); // Match your import pattern

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password
  await User.update(
    { password_hash: hashedPassword },
    { where: { id: userId } }
  );

  return true;
};

// Create password reset token
exports.createPasswordResetToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return await PasswordResetToken.create({
    user_id: userId,
    token: token,
    expires_at: expiresAt,
    used: false,
  });
};

// Reset password using token
exports.resetPasswordWithToken = async (token, newPassword) => {
  const bcrypt = require('bcrypt');
  const { User, PasswordResetToken } = require('../models');
  const { Op } = require('sequelize');

  // Input validation
  if (!token || typeof token !== 'string') {
    throw new Error('Valid token is required');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    throw new Error('Valid new password is required');
  }

  // Find the token first (to differentiate between not found and expired)
  const resetToken = await PasswordResetToken.findOne({
    where: { token: token },
  });

  // Token doesn't exist
  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  // Token already used
  if (resetToken.used) {
    throw new Error('Token already used');
  }

  // Token expired
  if (new Date() > resetToken.expires_at) {
    throw new Error('Invalid or expired reset token');
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    await User.update(
      { password_hash: hashedPassword },
      { where: { id: resetToken.user_id } }
    );

    // Mark token as used
    await resetToken.update({ used: true });

    // Optionally, invalidate all other reset tokens for this user
    await PasswordResetToken.update(
      { used: true },
      {
        where: {
          user_id: resetToken.user_id,
          id: { [Op.ne]: resetToken.id }, // Don't update the current token again
        },
      }
    );

    return true;
  } catch (dbError) {
    console.error('Database error during password reset:', dbError);
    throw new Error('Database error occurred during password reset');
  }
};
