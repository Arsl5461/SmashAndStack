const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await userService.listUsers(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Users fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await userService.getUser(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'User fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.auth, req.body);
  return ApiResponse.created(res, { message: 'User created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'User updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await userService.deleteUser(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'User deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await userService.deleteUsers(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Users deleted successfully', data });
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = await userService.resetPassword(req.auth, req.params.id, req.body.password);
  return ApiResponse.success(res, { message: 'Password reset successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove, resetPassword };
