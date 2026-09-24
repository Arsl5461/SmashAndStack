const organizationService = require('./organization.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getCurrent = asyncHandler(async (req, res) => {
  const data = await organizationService.getCurrent(req.auth.organizationId);
  return ApiResponse.success(res, { message: 'Organization fetched successfully', data });
});

const updateCurrent = asyncHandler(async (req, res) => {
  const data = await organizationService.updateCurrent(req.auth.organizationId, req.body);
  return ApiResponse.success(res, { message: 'Organization updated successfully', data });
});

module.exports = {
  getCurrent,
  updateCurrent,
};
