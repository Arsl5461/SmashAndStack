const express = require('express');
const controller = require('./order.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createOrderSchema, updateOrderSchema } = require('./order.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/', checkPermission(PERMISSIONS.ORDERS_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.ORDERS_CREATE), validate(createOrderSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.ORDERS_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.ORDERS_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.ORDERS_UPDATE), validate(updateOrderSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.ORDERS_DELETE), controller.remove);

module.exports = router;
