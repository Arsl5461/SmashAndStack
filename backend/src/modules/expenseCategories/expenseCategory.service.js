const expenseCategoryRepository = require('./expenseCategory.repository');
const { ConflictError, NotFoundError } = require('../../utils/AppError');

async function listCategories(auth, query) {
  return expenseCategoryRepository.list(auth.organizationId, query);
}

async function getCategory(auth, id) {
  const category = await expenseCategoryRepository.findById(id, auth.organizationId);
  if (!category) throw new NotFoundError('Expense category not found');
  return category;
}

async function createCategory(auth, payload) {
  const slug = expenseCategoryRepository.toSlug(payload.name);
  const existing = await expenseCategoryRepository.findBySlug(auth.organizationId, slug);
  if (existing) throw new ConflictError('An expense category with this name already exists');

  return expenseCategoryRepository.create({
    name: payload.name.trim(),
    isActive: payload.isActive !== false,
    organizationId: auth.organizationId,
  });
}

async function updateCategory(auth, id, payload) {
  await getCategory(auth, id);
  if (payload.name) {
    const slug = expenseCategoryRepository.toSlug(payload.name);
    const existing = await expenseCategoryRepository.findBySlug(auth.organizationId, slug);
    if (existing && existing._id.toString() !== id) {
      throw new ConflictError('An expense category with this name already exists');
    }
  }
  const category = await expenseCategoryRepository.updateById(id, auth.organizationId, payload);
  if (!category) throw new NotFoundError('Expense category not found');
  return category;
}

async function deleteCategory(auth, id) {
  const category = await getCategory(auth, id);
  const used = await expenseCategoryRepository.usageCount(auth.organizationId, category.name);
  if (used > 0) {
    throw new ConflictError('This category is used by existing expenses and cannot be deleted');
  }
  await expenseCategoryRepository.remove(id, auth.organizationId);
  return { deleted: true };
}

async function deleteCategories(auth, ids) {
  const categories = await Promise.all(ids.map((id) => expenseCategoryRepository.findById(id, auth.organizationId)));
  for (const category of categories.filter(Boolean)) {
    const used = await expenseCategoryRepository.usageCount(auth.organizationId, category.name);
    if (used > 0) {
      throw new ConflictError(`"${category.name}" is used by existing expenses and cannot be deleted`);
    }
  }
  const deleted = await expenseCategoryRepository.removeMany(ids, auth.organizationId);
  return { deleted };
}

async function assertActiveCategory(auth, name) {
  const category = await expenseCategoryRepository.findActiveByName(auth.organizationId, name);
  if (!category) throw new NotFoundError('Expense category not found or inactive');
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
