const storeService = require('./store.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total, counts } = await storeService.listStores(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Stores fetched successfully',
    data: { items, counts },
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await storeService.getStore(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Store fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await storeService.createStore(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Store created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await storeService.updateStore(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Store updated successfully', data });
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await storeService.updateStatus(req.auth, req.params.id, req.body.status);
  return ApiResponse.success(res, { message: 'Store status updated', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await storeService.deleteStore(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Store removed successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await storeService.deleteStores(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Stores removed successfully', data });
});

const assignUsers = asyncHandler(async (req, res) => {
  const data = await storeService.assignUsers(req.auth, req.params.id, req.body.userIds);
  return ApiResponse.success(res, { message: 'Store users updated', data });
});

const users = asyncHandler(async (req, res) => {
  const data = await storeService.getStoreUsers(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Store users fetched', data });
});

const dashboard = asyncHandler(async (req, res) => {
  const data = await storeService.getStoreDashboard(req.auth, req.params.id, req.query);
  return ApiResponse.success(res, { message: 'Store dashboard fetched', data });
});

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  remove,
  bulkRemove,
  assignUsers,
  users,
  dashboard,
};
