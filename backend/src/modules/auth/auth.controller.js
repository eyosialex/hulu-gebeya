const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await authService.logoutUser(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};