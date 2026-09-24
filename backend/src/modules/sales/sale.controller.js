const saleService = require('./sale.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await saleService.listSales(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Sales fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await saleService.getSale(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Sale fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await saleService.createSale(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Sale created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await saleService.updateSale(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Sale updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await saleService.deleteSale(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Sale deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await saleService.deleteSales(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Sales deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
