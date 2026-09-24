const { PaymentMethod, Expense, Sale, Order } = require('../../database/models');
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
    PaymentMethod.find(filter).sort({ name: 1 }).skip(query.skip).limit(query.limit),
    PaymentMethod.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return PaymentMethod.findOne({ _id: id, organizationId });
}

async function findBySlug(organizationId, slug) {
  return PaymentMethod.findOne({ organizationId, slug });
}

async function findActiveByName(organizationId, name) {
  return PaymentMethod.findOne({
    organizationId,
    isActive: true,
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  });
}

async function create(payload) {
  return PaymentMethod.create({
    ...payload,
    slug: toSlug(payload.name),
  });
}

async function updateById(id, organizationId, payload) {
  const update = { ...payload };
  if (payload.name) update.slug = toSlug(payload.name);
  return PaymentMethod.findOneAndUpdate({ _id: id, organizationId }, update, { new: true });
}

async function remove(id, organizationId) {
  return PaymentMethod.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, organizationId) {
  const result = await PaymentMethod.deleteMany({ _id: { $in: ids }, organizationId });
  return result.deletedCount || 0;
}

async function usageCount(organizationId, name) {
  const [expenses, sales, orders] = await Promise.all([
    Expense.countDocuments({ organizationId, paymentMethod: name }),
    Sale.countDocuments({ organizationId, paymentMethod: name }),
    Order.countDocuments({ organizationId, paymentMethod: name }),
  ]);
  return expenses + sales + orders;
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
