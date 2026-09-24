const express = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const { loginSchema } = require('./auth.validation');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh-token', controller.refresh);
router.post('/logout', authenticateUser, controller.logout);
router.get('/me', authenticateUser, controller.me);

module.exports = router;
