const express = require('express');
const controller = require('./product.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createProductSchema, updateProductSchema } = require('./product.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/', checkPermission(PERMISSIONS.PRODUCTS_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.PRODUCTS_CREATE), validate(createProductSchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.PRODUCTS_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.PRODUCTS_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.PRODUCTS_UPDATE), validate(updateProductSchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.PRODUCTS_DELETE), controller.remove);

module.exports = router;
