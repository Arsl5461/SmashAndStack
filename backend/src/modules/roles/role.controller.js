const roleService = require('./role.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await roleService.listRoles(req.auth);
  return ApiResponse.success(res, { message: 'Roles fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await roleService.createRole(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Role created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await roleService.updateRole(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Role updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await roleService.deleteRole(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Role deleted successfully', data });
});

const catalog = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, {
    message: 'Permissions fetched successfully',
    data: roleService.permissionCatalog(),
  });
});

module.exports = { list, create, update, remove, catalog };
