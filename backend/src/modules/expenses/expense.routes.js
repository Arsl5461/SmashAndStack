const express = require('express');
const controller = require('./expense.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createExpenseSchema, updateExpenseSchema } = require('./expense.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { uploadReceipt } = require('../../utils/storage');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/', checkPermission(PERMISSIONS.EXPENSES_READ), controller.list);
router.post('/bulk-delete', checkPermission(PERMISSIONS.EXPENSES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.post(
  '/',
  checkPermission(PERMISSIONS.EXPENSES_CREATE),
  uploadReceipt,
  validate(createExpenseSchema),
  controller.create
);
router.get('/:id', checkPermission(PERMISSIONS.EXPENSES_READ), controller.getById);
router.patch(
  '/:id',
  checkPermission(PERMISSIONS.EXPENSES_UPDATE),
  uploadReceipt,
  validate(updateExpenseSchema),
  controller.update
);
router.delete('/:id', checkPermission(PERMISSIONS.EXPENSES_DELETE), controller.remove);

module.exports = router;
