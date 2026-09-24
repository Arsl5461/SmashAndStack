const reportsService = require('./reports.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const profitLoss = asyncHandler(async (req, res) => {
  const data = await reportsService.profitLoss(req.auth, req.query);
  return ApiResponse.success(res, { message: 'Profit and loss report fetched', data });
});

const storeComparison = asyncHandler(async (req, res) => {
  const data = await reportsService.storeComparison(req.auth, req.query);
  return ApiResponse.success(res, { message: 'Store comparison fetched', data });
});

const tenderTypes = asyncHandler(async (req, res) => {
  const data = await reportsService.tenderTypes(req.auth, req.query);
  return ApiResponse.success(res, { message: 'Tender types report fetched', data });
});

const incomeExpenseStatement = asyncHandler(async (req, res) => {
  const data = await reportsService.incomeExpenseStatement(req.auth, req.query);
  return ApiResponse.success(res, { message: 'Income and expense statement fetched', data });
});

module.exports = { profitLoss, storeComparison, tenderTypes, incomeExpenseStatement };
