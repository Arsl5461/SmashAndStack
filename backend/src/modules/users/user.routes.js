const express = require('express');
const controller = require('./user.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission, requireSuperAdmin } = require('../../middleware/permission.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require('./user.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser, requireSuperAdmin);

router.get('/', checkPermission(PERMISSIONS.USERS_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.USERS_CREATE), validate(createUserSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.USERS_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.USERS_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.USERS_UPDATE), validate(updateUserSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.USERS_DELETE), controller.remove);
router.post(
  '/:id/reset-password',
  checkPermission(PERMISSIONS.USERS_UPDATE),
  validate(resetPasswordSchema),
  controller.resetPassword
);

module.exports = router;
