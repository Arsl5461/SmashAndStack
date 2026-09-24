const { User } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');

function buildFilter(organizationId, query) {
  const filter = { organizationId };
  if (query.roleId) filter.roleId = query.roleId;
  if (query.status === 'ACTIVE') filter.isActive = true;
  if (query.status === 'INACTIVE') filter.isActive = false;
  if (query.storeId) filter.stores = query.storeId;
  if (query.search) {
    filter.$or = [
      { name: { $regex: escapeRegex(query.search), $options: 'i' } },
      { email: { $regex: escapeRegex(query.search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(organizationId, query) {
  const filter = buildFilter(organizationId, query);
  const [items, total] = await Promise.all([
    User.find(filter)
      .populate('roleId', 'name slug')
      .populate('stores', 'name storeCode')
      .populate('defaultStore', 'name storeCode')
      .sort(query.sort)
      .skip(query.skip)
      .limit(query.limit),
    User.countDocuments(filter),
  ]);
  return { items, total };
}

async function findById(id, organizationId) {
  return User.findOne({ _id: id, organizationId })
    .populate('roleId', 'name slug permissions')
    .populate('stores', 'name storeCode')
    .populate('defaultStore', 'name storeCode');
}

async function findByEmail(organizationId, email) {
  return User.findOne({ organizationId, email: email.toLowerCase() });
}

async function create(payload) {
  const user = await User.create(payload);
  return findById(user._id, payload.organizationId);
}

async function updateById(id, organizationId, payload) {
  const user = await User.findOne({ _id: id, organizationId });
  if (!user) return null;
  Object.assign(user, payload);
  await user.save();
  return findById(id, organizationId);
}

async function remove(id, organizationId) {
  return User.findOneAndDelete({ _id: id, organizationId });
}

async function removeMany(ids, organizationId, excludeId) {
  const result = await User.deleteMany({
    _id: { $in: ids, $ne: excludeId },
    organizationId,
  });
  return result.deletedCount || 0;
}

module.exports = {
  list,
  findById,
  findByEmail,
  create,
  updateById,
  remove,
  removeMany,
};
