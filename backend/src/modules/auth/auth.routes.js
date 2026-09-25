const express = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.validation');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { authLimiter, otpLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh-token', controller.refresh);
router.post('/logout', authenticateUser, controller.logout);
router.get('/me', authenticateUser, controller.me);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/change-password', authenticateUser, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
