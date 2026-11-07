const { MoneyBorrowed } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');
const { scopedStoreFilter } = require('../../middleware/storeAccess.middleware');

function buildFilter(auth, query) {
  const filter = {
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth, query.storeId),
  };
  if (query.status === 'OPEN' || query.status === 'PAID') filter.status = query.status;
  if (query.startDate || query.endDate) {
    filter.borrowedDate = {};
    if (query.startDate) filter.borrowedDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.borrowedDate.$lte = new Date(query.endDate);
  }
  if (query.search) {
    filter.$or = [
      { borrowedFrom: { $regex: escapeRegex(query.search), $options: 'i' } },
      { note: { $regex: escapeRegex(query.search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(auth, query) {
  const filter = buildFilter(auth, query);
  const [items, total] = await Promise.all([
    MoneyBorrowed.find(filter)
      .populate('storeId', 'name storeCode')
      .populate('createdBy', 'name')
      .sort(query.sortBy === 'createdAt' ? { borrowedDate: query.sortOrder } : query.sort)
      .skip(query.skip)
      .limit(query.limit),
    MoneyBorrowed.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return MoneyBorrowed.findOne({ _id: id, organizationId })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function create(payload) {
  const item = await MoneyBorrowed.create(payload);
  return findById(item._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  return MoneyBorrowed.findOneAndUpdate({ _id: id, organizationId }, payload, { new: true })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function remove(id, organizationId) {
  return MoneyBorrowed.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, auth) {
  const result = await MoneyBorrowed.deleteMany({
    _id: { $in: ids },
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth),
  });
  return result.deletedCount || 0;
}

async function sumOpen(auth, storeId) {
  const items = await MoneyBorrowed.find({
    organizationId: auth.organizationId,
    status: 'OPEN',
    ...scopedStoreFilter(auth, storeId),
  }).select('amount');
  return {
    total: Number(items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)),
    count: items.length,
  };
}

module.exports = { list, findById, create, updateById, remove, removeMany, sumOpen };
