const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { refreshCookieOptions } = require('../../utils/token');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions());
  return ApiResponse.success(res, {
    message: 'Logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refresh(token);
  res.cookie('refreshToken', result.refreshToken, refreshCookieOptions());
  return ApiResponse.success(res, {
    message: 'Token refreshed',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await authService.logout(req.user._id);
  }
  res.clearCookie('refreshToken', refreshCookieOptions());
  return ApiResponse.success(res, { message: 'Logged out successfully', data: {} });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user);
  return ApiResponse.success(res, { message: 'Profile fetched successfully', data: user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return ApiResponse.success(res, { message: result.message, data: {} });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const data = await authService.verifyOtp(req.body);
  return ApiResponse.success(res, { message: 'Verification code confirmed', data });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordWithOtp(req.body);
  return ApiResponse.success(res, { message: 'Password updated successfully', data: {} });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.auth.userId, req.body);
  return ApiResponse.success(res, { message: 'Password updated successfully', data: {} });
});

module.exports = {
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
};
