const saleCategoryRepository = require('./saleCategory.repository');
const { ConflictError, NotFoundError } = require('../../utils/AppError');

async function listCategories(auth, query) {
  return saleCategoryRepository.list(auth.organizationId, query);
}

async function getCategory(auth, id) {
  const category = await saleCategoryRepository.findById(id, auth.organizationId);
  if (!category) throw new NotFoundError('Sale category not found');
  return category;
}

async function createCategory(auth, payload) {
  const slug = saleCategoryRepository.toSlug(payload.name);
  const existing = await saleCategoryRepository.findBySlug(auth.organizationId, slug);
  if (existing) throw new ConflictError('A sale category with this name already exists');

  return saleCategoryRepository.create({
    name: payload.name.trim(),
    isActive: payload.isActive !== false,
    organizationId: auth.organizationId,
  });
}

async function updateCategory(auth, id, payload) {
  await getCategory(auth, id);
  if (payload.name) {
    const slug = saleCategoryRepository.toSlug(payload.name);
    const existing = await saleCategoryRepository.findBySlug(auth.organizationId, slug);
    if (existing && existing._id.toString() !== id) {
      throw new ConflictError('A sale category with this name already exists');
    }
  }
  const category = await saleCategoryRepository.updateById(id, auth.organizationId, payload);
  if (!category) throw new NotFoundError('Sale category not found');
  return category;
}

async function deleteCategory(auth, id) {
  const category = await getCategory(auth, id);
  const used = await saleCategoryRepository.usageCount(auth.organizationId, category.name);
  if (used > 0) {
    throw new ConflictError('This category is used by existing sales and cannot be deleted');
  }
  await saleCategoryRepository.remove(id, auth.organizationId);
  return { deleted: true };
}

async function deleteCategories(auth, ids) {
  const categories = await Promise.all(ids.map((id) => saleCategoryRepository.findById(id, auth.organizationId)));
  for (const category of categories.filter(Boolean)) {
    const used = await saleCategoryRepository.usageCount(auth.organizationId, category.name);
    if (used > 0) {
      throw new ConflictError(`"${category.name}" is used by existing sales and cannot be deleted`);
    }
  }
  const deleted = await saleCategoryRepository.removeMany(ids, auth.organizationId);
  return { deleted };
}

async function assertActiveCategory(auth, name) {
  const category = await saleCategoryRepository.findActiveByName(auth.organizationId, name);
  if (!category) throw new NotFoundError('Sale category not found or inactive');
  return category.name;
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategories,
  assertActiveCategory,
};
