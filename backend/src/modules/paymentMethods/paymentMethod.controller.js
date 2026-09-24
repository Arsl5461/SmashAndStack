const paymentMethodService = require('./paymentMethod.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await paymentMethodService.listMethods(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Payment methods fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await paymentMethodService.getMethod(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Payment method fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await paymentMethodService.createMethod(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Payment method created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await paymentMethodService.updateMethod(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Payment method updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await paymentMethodService.deleteMethod(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Payment method deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await paymentMethodService.deleteMethods(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Payment methods deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
