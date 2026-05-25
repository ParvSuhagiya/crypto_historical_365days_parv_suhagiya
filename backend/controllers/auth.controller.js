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

exports.deleteProfile = asyncHandler(async (req, res) => {
  const data = await authService.deleteProfile(req.user.id);
  ok(res, 'Profile deleted', data, {});
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  ok(res, 'Request processed', data, {});
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.body);
  ok(res, 'Password reset', data, {});
});

exports.changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.user.id, req.body);
  ok(res, 'Password changed', data, {});
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const data = await authService.verifyEmail(req.body);
  ok(res, 'Verification processed', data, {});
});

exports.jwtProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  ok(res, 'JWT profile', data, {});
});


exports.jwtDashboard = asyncHandler(async (req, res) => {
  const data = await statsService.adminStatsDashboard();
  ok(res, 'JWT dashboard snapshot', { user: req.user, stats: data }, {});
});

exports.generateToken = asyncHandler(async (req, res) => {
  const data = await authService.generateTokenForPayload(req.body);
  ok(res, 'Token generated', data, {});
});

exports.verifyToken = asyncHandler(async (req, res) => {
  const token = req.body.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const data = await authService.verifyTokenString(token);
  ok(res, 'Token valid', data, {});
});

exports.jwtAdmin = asyncHandler(async (req, res) => {
  ok(res, 'Admin JWT route', { user: req.user }, {});
});

exports.privateStats = asyncHandler(async (req, res) => {
  const data = await statsService.marketSummary();
  ok(res, 'Private stats', data, {});
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refreshToken(req.user);
  ok(res, 'Token refreshed', data, {});
});

exports.revokeToken = asyncHandler(async (req, res) => {
  const data = await authService.revokeToken();
  ok(res, 'Token revoked', data, {});
});
