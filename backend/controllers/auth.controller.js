const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const statsService = require('../services/stats.service');

const ok = (res, message, data, pagination = {}, status = 200) => {
  res.status(status).json({ success: true, message, data, pagination });
};

exports.register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  ok(res, 'Registered successfully', data, {}, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  ok(res, 'Login successful', data, {});
});

exports.logout = asyncHandler(async (req, res) => {
  const data = await authService.logoutUser();
  ok(res, 'Logout successful', data, {});
});

exports.getProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  ok(res, 'Profile fetched', data, {});
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  ok(res, 'Profile updated', data, {});
});