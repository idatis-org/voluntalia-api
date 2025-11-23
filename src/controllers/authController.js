const authService = require('../services/authService');
const emailService = require('../services/emailService');
const roles = require('../constants/roles');
const crypto = require('crypto');

// * Register a new user
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = roles.VOLUNTEER,
      country,
      city,
      skills,
    } = req.body;

    // ! Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'name, email and password are required' });
    }

    // ? Restrict roles to allowed values
    const allowed = ['COORDINATOR', 'VOLUNTEER', 'LEGAL'];
    if (!allowed.includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    // * Create user via service layer
    const user = await authService.register({
      name,
      email,
      password,
      role,
      country,
      city,
      skills,
    });

    // * Send welcome email with password reset link (secure, non-blocking)
    setImmediate(async () => {
      try {
        // Additional validation before sending email
        if (!user?.email || !user?.name) {
          return;
        }

        // Validate email format one more time
        if (!emailService.isValidEmail(user.email)) {
          return;
        }

        // Check rate limiting for this email
        if (!emailService.checkRateLimit(user.email)) {
          return;
        }

        // Generate secure password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Store token in database VIA SERVICE (following your pattern)
        await authService.createPasswordResetToken(user.id, resetToken);

        // Send welcome email with reset link
        await emailService.sendWelcomeEmail(user.email, user.name, resetToken);
        console.log(
          `✅ Welcome email sent successfully to ${user.email} (User ID: ${user.id})`
        );
      } catch (emailError) {
        // Log error but don't fail registration
        console.error('❌ Failed to send welcome email:', {
          error: emailError.message,
          userId: user?.id,
          email: user?.email,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// * Authenticate user and issue tokens
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ! Verify credentials
    const user = await authService.checkCredentials(email, password);

    // * Generate new access and refresh tokens
    const { accessToken, refreshToken } = await authService.createToken(user);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// * Exchange refresh token for new access token
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // ! Ensure refresh token is provided
    if (!refreshToken)
      return res.status(400).json({ error: 'refreshToken required' });

    const accesToken = await authService.refresh(refreshToken);
    return res.status(201).json({ accesToken });
  } catch (err) {
    next(err);
  }
};

// * Invalidate refresh token on logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // ! Ensure refresh token is provided
    if (!refreshToken)
      return res.status(400).json({ error: 'refreshToken required' });

    await authService.logout(refreshToken);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// * Return current authenticated user info
exports.me = async (req, res, next) => {
  try {
    const { sub } = req.user;

    // ? Fetch user details by JWT subject
    const user = await authService.getCurrentUser(sub);
    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// * Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Input validation with specific error messages
    if (!token) {
      return res.status(400).json({
        error: 'Reset token is required',
        code: 'MISSING_TOKEN',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: 'New password is required',
        code: 'MISSING_PASSWORD',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    // Handle password reset VIA SERVICE (following your pattern)
    await authService.resetPasswordWithToken(token, newPassword);

    console.log(
      `✅ Password reset successful for token: ${token.substring(0, 10)}...`
    );

    res.json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (err) {
    console.error('❌ Password reset failed:', {
      error: err.message,
      token: req.body?.token?.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });

    // Handle specific password reset errors
    if (err.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        error:
          'This password reset link is invalid or has expired. Please request a new password reset.',
        code: 'INVALID_TOKEN',
        action: 'REQUEST_NEW_RESET',
      });
    }

    if (err.message === 'Token already used') {
      return res.status(400).json({
        error:
          'This password reset link has already been used. Please request a new password reset.',
        code: 'TOKEN_ALREADY_USED',
        action: 'REQUEST_NEW_RESET',
      });
    }

    // Generic database or server errors
    return res.status(500).json({
      error:
        'An error occurred while resetting your password. Please try again.',
      code: 'SERVER_ERROR',
      action: 'RETRY',
    });
  }
};
