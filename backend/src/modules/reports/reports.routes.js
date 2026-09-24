const express = require('express');
const controller = require('./reports.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/permission.middleware');
const { checkStoreAccess } = require('../../middleware/storeAccess.middleware');
const { PERMISSIONS } = require('../../constants/permissions');

const router = express.Router();
router.use(authenticateUser, checkStoreAccess);

router.get('/profit-loss', checkPermission(PERMISSIONS.REPORTS_READ), controller.profitLoss);
router.get('/store-comparison', checkPermission(PERMISSIONS.REPORTS_READ), controller.storeComparison);
router.get('/tender-types', checkPermission(PERMISSIONS.REPORTS_READ), controller.tenderTypes);
router.get('/income-expense-statement', checkPermission(PERMISSIONS.REPORTS_READ), controller.incomeExpenseStatement);

module.exports = router;
