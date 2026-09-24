const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview(req.auth, req.query);
  return ApiResponse.success(res, { message: 'Dashboard overview fetched successfully', data });
});

module.exports = { overview };
