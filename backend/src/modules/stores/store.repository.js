const { Store, User, Sale, Expense, Order } = require('../../database/models');
const { escapeRegex } = require('../../utils/pagination');

function baseFilter(organizationId, { search, status, allowedStoreIds, isSuperAdmin }) {
  const filter = { organizationId, deletedAt: null };
  if (!isSuperAdmin) {
    filter._id = { $in: allowedStoreIds };
  }
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: 'i' } },
      { storeCode: { $regex: escapeRegex(search), $options: 'i' } },
      { city: { $regex: escapeRegex(search), $options: 'i' } },
    ];
  }
  return filter;
}

async function list(organizationId, query, auth) {
  const filter = baseFilter(organizationId, {
    search: query.search,
    status: query.status,
    allowedStoreIds: auth.storeIds,
    isSuperAdmin: auth.isSuperAdmin,
  });

  const [items, total] = await Promise.all([
    Store.find(filter)
      .populate('manager', 'name email')
      .sort(query.sort)
      .skip(query.skip)
      .limit(query.limit),
    Store.countDocuments(filter),
  ]);

  return { items, total };
}

async function findById(id, organizationId) {
  return Store.findOne({ _id: id, organizationId, deletedAt: null }).populate('manager', 'name email');
}

async function findByCode(organizationId, storeCode) {
  return Store.findOne({ organizationId, storeCode: storeCode.toUpperCase(), deletedAt: null });
}

async function create(payload) {
  return Store.create(payload);
}

async function updateById(id, organizationId, payload) {
  return Store.findOneAndUpdate({ _id: id, organizationId, deletedAt: null }, payload, {
    new: true,
  }).populate('manager', 'name email');
}

async function softDelete(id, organizationId) {
  return Store.findOneAndUpdate(
    { _id: id, organizationId },
    { deletedAt: new Date(), status: 'INACTIVE' },
    { new: true }
  );
}

async function hardDelete(id, organizationId) {
  return Store.findOneAndDelete({ _id: id, organizationId });
}

async function hasFinancialHistory(storeId) {
  const [sales, expenses, orders] = await Promise.all([
    Sale.countDocuments({ storeId }),
    Expense.countDocuments({ storeId }),
    Order.countDocuments({ storeId }),
  ]);
  return sales + expenses + orders > 0;
}

async function countByStatus(organizationId, auth) {
  const match = { organizationId, deletedAt: null };
  if (!auth.isSuperAdmin) match._id = { $in: auth.storeIds };

  const [total, active, inactive, closed] = await Promise.all([
    Store.countDocuments(match),
    Store.countDocuments({ ...match, status: 'ACTIVE' }),
    Store.countDocuments({ ...match, status: 'INACTIVE' }),
    Store.countDocuments({ ...match, status: 'TEMPORARILY_CLOSED' }),
  ]);

  return { total, active, inactive, closed };
}

async function assignUsers(storeId, userIds) {
  await User.updateMany({ stores: storeId }, { $pull: { stores: storeId } });
  if (userIds.length) {
    await User.updateMany({ _id: { $in: userIds } }, { $addToSet: { stores: storeId } });
  }
  return User.find({ stores: storeId }).select('name email roleId isActive').populate('roleId', 'name slug');
}

async function listUsers(storeId) {
  return User.find({ stores: storeId }).select('name email roleId isActive lastLogin').populate('roleId', 'name slug');
}

module.exports = {
  list,
  findById,
  findByCode,
  create,
  updateById,
  softDelete,
  hardDelete,
  hasFinancialHistory,
  countByStatus,
  assignUsers,
  listUsers,
};
