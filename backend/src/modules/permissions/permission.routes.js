const express = require('express');
const { catalog } = require('../roles/role.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();
router.use(authenticateUser);
router.get('/', checkPermission(PERMISSIONS.ROLES_READ), catalog);

module.exports = router;
