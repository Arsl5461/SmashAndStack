const express = require('express');
const controller = require('./role.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission, requireSuperAdmin } = require('../../middleware/permission.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upsertRoleSchema, updateRoleSchema } = require('./role.validation');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();
router.use(authenticateUser, requireSuperAdmin);

router.get('/', checkPermission(PERMISSIONS.ROLES_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.ROLES_CREATE), validate(upsertRoleSchema), controller.create);
router.patch('/:id', checkPermission(PERMISSIONS.ROLES_UPDATE), validate(updateRoleSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.ROLES_DELETE), controller.remove);

module.exports = router;
