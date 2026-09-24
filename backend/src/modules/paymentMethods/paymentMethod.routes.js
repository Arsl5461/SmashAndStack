const express = require('express');
const controller = require('./paymentMethod.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createPaymentMethodSchema, updatePaymentMethodSchema } = require('./paymentMethod.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser);

router.get('/', controller.list);
router.post('/', checkPermission(PERMISSIONS.EXPENSES_CREATE), validate(createPaymentMethodSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.EXPENSES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.EXPENSES_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.EXPENSES_UPDATE), validate(updatePaymentMethodSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.EXPENSES_DELETE), controller.remove);

module.exports = router;
