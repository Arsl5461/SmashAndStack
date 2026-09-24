const express = require('express');
const controller = require('./sale.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createSaleSchema, updateSaleSchema } = require('./sale.validation');
const { bulkDeleteSchema } = require('../../utils/bulk');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/', checkPermission(PERMISSIONS.SALES_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.SALES_CREATE), validate(createSaleSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.SALES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.SALES_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.SALES_UPDATE), validate(updateSaleSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.SALES_DELETE), controller.remove);

module.exports = router;
