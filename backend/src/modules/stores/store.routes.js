const express = require('express');
const controller = require('./store.controller');
const reportsController = require('../reports/reports.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createStoreSchema,
  updateStoreSchema,
  statusSchema,
  assignUsersSchema,
} = require('./store.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();

router.use(authenticateUser);

router.get('/comparison', checkPermission(PERMISSIONS.STORES_ANALYTICS), reportsController.storeComparison);
router.get('/', checkPermission(PERMISSIONS.STORES_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.STORES_CREATE), validate(createStoreSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.STORES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.STORES_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.STORES_UPDATE), validate(updateStoreSchema), controller.update);
router.patch(
  '/:id/status',
  checkPermission(PERMISSIONS.STORES_UPDATE),
  validate(statusSchema),
  controller.updateStatus
);
router.delete('/:id', checkPermission(PERMISSIONS.STORES_DELETE), controller.remove);
router.get('/:id/users', checkPermission(PERMISSIONS.USERS_READ), controller.users);
router.patch(
  '/:id/users',
  checkPermission(PERMISSIONS.USERS_UPDATE),
  validate(assignUsersSchema),
  controller.assignUsers
);
router.get(
  '/:id/dashboard',
  checkPermission(PERMISSIONS.STORES_ANALYTICS),
  checkStoreAccess,
  controller.dashboard
);
router.get(
  '/:id/analytics',
  checkPermission(PERMISSIONS.STORES_ANALYTICS),
  checkStoreAccess,
  controller.dashboard
);

module.exports = router;
