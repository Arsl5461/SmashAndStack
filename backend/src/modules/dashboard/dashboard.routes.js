const express = require('express');
const controller = require('./dashboard.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);
router.get('/overview', checkPermission(PERMISSIONS.DASHBOARD_READ), controller.overview);

module.exports = router;
