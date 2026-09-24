const orderService = require('./order.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await orderService.listOrders(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Orders fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await orderService.getOrder(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Order fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await orderService.createOrder(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Order created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrder(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Order updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await orderService.deleteOrder(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Order deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await orderService.deleteOrders(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Orders deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
