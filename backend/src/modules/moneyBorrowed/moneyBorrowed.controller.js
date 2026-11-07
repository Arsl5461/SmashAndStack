const moneyBorrowedService = require('./moneyBorrowed.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await moneyBorrowedService.listBorrowed(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Borrowed money fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.getBorrowed(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Borrowed money fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.createBorrowed(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Borrowed money recorded successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.updateBorrowed(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Borrowed money updated successfully', data });
});

const markPaid = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.markPaid(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Borrowed money marked as paid', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.deleteBorrowed(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Borrowed money deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await moneyBorrowedService.deleteBorrowedMany(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Borrowed money deleted successfully', data });
});

module.exports = { list, getById, create, update, markPaid, remove, bulkRemove };
