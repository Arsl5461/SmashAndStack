const saleCategoryService = require('./saleCategory.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { parseListQuery, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { items, total } = await saleCategoryService.listCategories(req.auth, query);
  return ApiResponse.success(res, {
    message: 'Sale categories fetched successfully',
    data: items,
    meta: buildMeta({ page: query.page, limit: query.limit, total }),
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await saleCategoryService.getCategory(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Sale category fetched successfully', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await saleCategoryService.createCategory(req.auth, req.body);
  return ApiResponse.created(res, { message: 'Sale category created successfully', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await saleCategoryService.updateCategory(req.auth, req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Sale category updated successfully', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await saleCategoryService.deleteCategory(req.auth, req.params.id);
  return ApiResponse.success(res, { message: 'Sale category deleted successfully', data });
});

const bulkRemove = asyncHandler(async (req, res) => {
  const data = await saleCategoryService.deleteCategories(req.auth, req.body.ids);
  return ApiResponse.success(res, { message: 'Sale categories deleted successfully', data });
});

module.exports = { list, getById, create, update, remove, bulkRemove };
