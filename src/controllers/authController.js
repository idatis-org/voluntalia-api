const authService = require("../services/authService");
const roles = require("../constants/roles");

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
    } = req.body;

    // ! Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }

    // ? Restrict roles to allowed values
    const allowed = ["COORDINATOR", "VOLUNTEER", "LEGAL"];
    if (!allowed.includes(role))
      return res.status(400).json({ error: "Invalid role" });

    // * Create user via service layer
    const user = await authService.register({
      name,
      email,
      password,
      role,
      country,
      city,
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
      return res.status(400).json({ error: "refreshToken required" });

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
      return res.status(400).json({ error: "refreshToken required" });

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
