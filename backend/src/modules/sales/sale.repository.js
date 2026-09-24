const { Sale } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');
const { scopedStoreFilter } = require('../../middleware/storeAccess.middleware');

function buildFilter(auth, query) {
  const filter = {
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth, query.storeId),
  };

  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.saleDate = {};
    if (query.startDate) filter.saleDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.saleDate.$lte = new Date(query.endDate);
  }
  if (query.search) {
    filter.$or = [
      { customerName: { $regex: escapeRegex(query.search), $options: 'i' } },
      { orderReference: { $regex: escapeRegex(query.search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(auth, query) {
  const filter = buildFilter(auth, query);
  const [items, total] = await Promise.all([
    Sale.find(filter)
      .populate('storeId', 'name storeCode')
      .populate('createdBy', 'name')
      .sort(query.sortBy === 'createdAt' ? { saleDate: query.sortOrder } : query.sort)
      .skip(query.skip)
      .limit(query.limit),
    Sale.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return Sale.findOne({ _id: id, organizationId })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function create(payload) {
  const sale = await Sale.create(payload);
  return findById(sale._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  return Sale.findOneAndUpdate({ _id: id, organizationId }, payload, { new: true })
    .populate('storeId', 'name storeCode')
    .populate('createdBy', 'name');
}

async function remove(id, organizationId) {
  return Sale.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, auth) {
  const result = await Sale.deleteMany({
    _id: { $in: ids },
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth),
  });
  return result.deletedCount || 0;
}

module.exports = { list, findById, create, updateById, remove, removeMany };
