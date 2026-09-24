const express = require('express');
const controller = require('./organization.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { updateOrganizationSchema } = require('./organization.validation');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();

router.use(authenticateUser);
router.get('/current', checkPermission(PERMISSIONS.SETTINGS_READ), controller.getCurrent);
router.patch(
  '/current',
  checkPermission(PERMISSIONS.SETTINGS_UPDATE),
  validate(updateOrganizationSchema),
  controller.updateCurrent
);

module.exports = router;
