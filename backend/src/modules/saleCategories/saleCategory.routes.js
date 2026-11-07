const express = require('express');
const controller = require('./saleCategory.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createCategorySchema, updateCategorySchema } = require('./saleCategory.validation');
const { PERMISSIONS } = require('../../constants/permissions');
const { bulkDeleteSchema } = require('../../utils/bulk');

const router = express.Router();
router.use(authenticateUser);

router.get('/', checkPermission(PERMISSIONS.SALES_READ), controller.list);
router.post('/', checkPermission(PERMISSIONS.SALES_CREATE), validate(createCategorySchema), controller.create);
router.post('/bulk-delete', checkPermission(PERMISSIONS.SALES_DELETE), validate(bulkDeleteSchema), controller.bulkRemove);
router.get('/:id', checkPermission(PERMISSIONS.SALES_READ), controller.getById);
router.patch('/:id', checkPermission(PERMISSIONS.SALES_UPDATE), validate(updateCategorySchema), controller.update);
router.delete('/:id', checkPermission(PERMISSIONS.SALES_DELETE), controller.remove);

module.exports = router;
