const express = require('express');
const controller = require('./moneyBorrowed.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createBorrowedSchema, updateBorrowedSchema } = require('./moneyBorrowed.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/', checkPermission(PERMISSIONS.EXPENSES_READ), controller.list);
router.post('/bulk-delete', checkPermission(PERMISSIONS.EXPENSES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.post('/', checkPermission(PERMISSIONS.EXPENSES_CREATE), validate(createBorrowedSchema), controller.create);
router.get('/:id', checkPermission(PERMISSIONS.EXPENSES_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.EXPENSES_UPDATE), validate(updateBorrowedSchema), controller.update);
router.post('/:id/mark-paid', checkPermission(PERMISSIONS.EXPENSES_UPDATE), controller.markPaid);
router.delete('/:id', checkPermission(PERMISSIONS.EXPENSES_DELETE), controller.remove);

module.exports = router;
