const productService = require('./product.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await productService.listProducts(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Products fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await productService.getProduct(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Product fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await productService.createProduct(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Product created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Product updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await productService.deleteProduct(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Product deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await productService.deleteProducts(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Products deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
