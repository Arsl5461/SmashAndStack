const { ExpenseCategory, Expense } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');

function toSlug(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFilter(organizationId, query) {
  const filter = { organizationId };
  if (query.status === 'ACTIVE') filter.isActive = true;
  if (query.status === 'INACTIVE') filter.isActive = false;
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: 'i' };
  return filter;
}

async function list(organizationId, query) {
  const filter = buildFilter(organizationId, query);
  const [items, total] = await Promise.all([
    ExpenseCategory.find(filter).sort({ name: 1 }).skip(query.skip).limit(query.limit),
    ExpenseCategory.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return ExpenseCategory.findOne({ _id: id, organizationId });
}

async function findBySlug(organizationId, slug) {
  return ExpenseCategory.findOne({ organizationId, slug });
}

async function findActiveByName(organizationId, name) {
  return ExpenseCategory.findOne({
    organizationId,
    isActive: true,
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  });
}

async function create(payload) {
  return ExpenseCategory.create({
    ...payload,
    slug: toSlug(payload.name),
  });
}

async function updateById(id, organizationId, payload) {
  const update = { ...payload };
  if (payload.name) update.slug = toSlug(payload.name);
  return ExpenseCategory.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
}

async function remove(id, organizationId) {
  return ExpenseCategory.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, organizationId) {
  const result = await ExpenseCategory.deleteMany({ _id: { $in: ids }, organizationId });
  return result.deletedCount || 0;
}

async function usageCount(organizationId, name) {
  return Expense.countDocuments({ organizationId, category: name });
}

module.exports = {
  toSlug,
  list,
  findById,
  findBySlug,
  findActiveByName,
  create,
  updateById,
  remove,
  removeMany,
  usageCount,
};
