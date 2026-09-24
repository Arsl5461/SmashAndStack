const { Order } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');
const { scopedStoreFilter } = require('../../middleware/storeAccess.middleware');

function buildFilter(auth, query) {
  const filter = {
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth, query.storeId),
  };
  if (query.status) filter.status = query.status;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.orderDate = {};
    if (query.startDate) filter.orderDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.orderDate.$lte = new Date(query.endDate);
  }
  if (query.search) {
    filter.$or = [
      { orderNumber: { $regex: escapeRegex(query.search), $options: 'i' } },
      { 'customer.name': { $regex: escapeRegex(query.search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(auth, query) {
  const filter = buildFilter(auth, query);
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('storeId', 'name storeCode')
      .sort(query.sortBy === 'createdAt' ? { orderDate: query.sortOrder } : query.sort)
      .skip(query.skip)
      .limit(query.limit),
    Order.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return Order.findOne({ _id: id, organizationId }).populate('storeId', 'name storeCode');
}

async function nextOrderNumber(organizationId) {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({ organizationId });
  return `SNS-${year}-${String(count + 1).padStart(6, '0')}`;
}

async function create(payload) {
  const order = await Order.create(payload);
  return findById(order._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  return Order.findOneAndUpdate({ _id: id, organizationId }, payload, { new: true }).populate(
    'storeId',
    'name storeCode'
  );
}

async function remove(id, organizationId) {
  return Order.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, auth) {
  const result = await Order.deleteMany({
    _id: { $in: ids },
    organizationId: auth.organizationId,
    ...scopedStoreFilter(auth),
  });
  return result.deletedCount || 0;
}

module.exports = { list, findById, nextOrderNumber, create, updateById, remove, removeMany };
