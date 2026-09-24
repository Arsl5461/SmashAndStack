const storeRepository = require('./store.repository');
const { ConflictError, NotFoundError, ForbiddenError } = require('../../utils/AppError');
const dashboardService = require('../dashboard/dashboard.service');

async function listStores(auth, query) {
  const [{ items, total }, counts] = await Promise.all([
    storeRepository.list(auth.organizationId, query, auth),
    storeRepository.countByStatus(auth.organizationId, auth),
  ]);
  return { items, total, counts };
}

async function getStore(auth, id) {
  const store = await storeRepository.findById(id, auth.organizationId);
  if (!store) throw new NotFoundError('Store not found');
  if (!auth.isSuperAdmin && !auth.storeIds.map(String).includes(id)) {
    throw new ForbiddenError('You do not have access to this store');
  }
  return store;
}

async function createStore(auth, payload) {
  const existing = await storeRepository.findByCode(auth.organizationId, payload.storeCode);
  if (existing) throw new ConflictError('Store code must be unique');

  return storeRepository.create({
    ...payload,
    storeCode: payload.storeCode.toUpperCase(),
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    openingDate: payload.openingDate ? new Date(payload.openingDate) : undefined,
  });
}

async function updateStore(auth, id, payload) {
  await getStore(auth, id);
  if (payload.storeCode) {
    const existing = await storeRepository.findByCode(auth.organizationId, payload.storeCode);
    if (existing && existing._id.toString() !== id) {
      throw new ConflictError('Store code must be unique');
    }
    payload.storeCode = payload.storeCode.toUpperCase();
  }
  if (payload.openingDate) payload.openingDate = new Date(payload.openingDate);
  return storeRepository.updateById(id, auth.organizationId, payload);
}

async function updateStatus(auth, id, status) {
  await getStore(auth, id);
  return storeRepository.updateById(id, auth.organizationId, { status });
}

async function deleteStore(auth, id) {
  await getStore(auth, id);
  const hasHistory = await storeRepository.hasFinancialHistory(id);
  if (hasHistory) {
    return storeRepository.softDelete(id, auth.organizationId);
  }
  await storeRepository.hardDelete(id, auth.organizationId);
  return { deleted: true, soft: false };
}

async function deleteStores(auth, ids) {
  const results = [];
  for (const id of ids) {
    results.push(await deleteStore(auth, id));
  }
  return { deleted: results.length, results };
}

async function assignUsers(auth, id, userIds) {
  await getStore(auth, id);
  return storeRepository.assignUsers(id, userIds);
}

async function getStoreUsers(auth, id) {
  await getStore(auth, id);
  return storeRepository.listUsers(id);
}

async function getStoreDashboard(auth, id, query) {
  await getStore(auth, id);
  return dashboardService.getOverview(auth, { ...query, storeId: id });
}

module.exports = {
  listStores,
  getStore,
  createStore,
  updateStore,
  updateStatus,
  deleteStore,
  deleteStores,
  assignUsers,
  getStoreUsers,
  getStoreDashboard,
};
