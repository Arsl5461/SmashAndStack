const { Expense } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');
const { scopedStoreFilter } = require('../../middleware/storeAccess.middleware');

function buildFilter(auth, query) {
  const filter = {
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth, query.storeId),
  };
  if (query.category) filter.category = query.category;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.expenseDate = {};
    if (query.startDate) filter.expenseDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.expenseDate.$lte = new Date(query.endDate);
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: escapeRegex(query.search), $options: 'i' } },
      { description: { $regex: escapeRegex(query.search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(auth, query) {
  const filter = buildFilter(auth, query);
  const [items, total] = await Promise.all([
    Expense.find(filter)
      .populate('storeId', 'name storeCode')
      .populate('createdBy', 'name')
      .sort(query.sortBy === 'createdAt' ? { expenseDate: query.sortOrder } : query.sort)
      .skip(query.skip)
      .limit(query.limit),
    Expense.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return Expense.findOne({ _id: id, organizationId })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function create(payload) {
  const expense = await Expense.create(payload);
  return findById(expense._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  return Expense.findOneAndUpdate({ _id: id, organizationId }, payload, { new: true })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function remove(id, organizationId) {
  return Expense.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, auth) {
  const result = await Expense.deleteMany({
    _id: { $in: ids },
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth),
  });
  return result.deletedCount || 0;
}

module.exports = { list, findById, create, updateById, remove, removeMany };
