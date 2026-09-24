const { Product } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');

function buildFilter(auth, query) {
  const filter = { organizationId: auth.organizationId };
  if (query.storeId) {
    filter.$or = [{ storeId: query.storeId }, { storeId: null }];
  } else if (!auth.isSuperAdmin) {
    filter.$or = [{ storeId: { $in: auth.storeIds } }, { storeId: null }];
  }
  if (query.category) filter.category = query.category;
  if (query.status === 'AVAILABLE') filter.isAvailable = true;
  if (query.status === 'UNAVAILABLE') filter.isAvailable = false;
  if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: 'i' };
  return filter;
}

async function list(auth, query) {
  const filter = buildFilter(auth, query);
  const [items, total] = await Promise.all([
    Product.find(filter).populate('storeId', 'name storeCode').sort(query.sort).skip(query.skip).limit(query.limit),
    Product.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return Product.findOne({ _id: id, organizationId }).populate('storeId', 'name storeCode');
}

async function create(payload) {
  const product = await Product.create(payload);
  return findById(product._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  return Product.findOneAndUpdate({ _id: id, organizationId }, payload, { new: true }).populate(
    'storeId',
    'name storeCode'
  );
}

async function remove(id, organizationId) {
  return Product.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, organizationId) {
  const result = await Product.deleteMany({ _id: { $in: ids }, organizationId });
  return result.deletedCount || 0;
}

module.exports = { list, findById, create, updateById, remove, removeMany };
