const expenseService = require('./expense.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');
const { publicFileUrl } = require('../../utils/storage');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await expenseService.listExpenses(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Expenses fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await expenseService.getExpense(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Expense fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const receiptUrl = req.file ? publicFileUrl(req, req.file.filename) : '';
  const data = await expenseService.createExpense(req.auth, req.body, receiptUrl);
  return ApiResponse.created(res, { message: 'Expense created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const receiptUrl = req.file ? publicFileUrl(req, req.file.filename) : undefined;
  const data = await expenseService.updateExpense(req.auth, req.params.id, req.body, receiptUrl);
  return ApiResponse.success(res, { message: 'Expense updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await expenseService.deleteExpense(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Expense deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await expenseService.deleteExpenses(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Expenses deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
