const paymentMethodRepository = require('./paymentMethod.repository');
const { ConflictError, NotFoundError } = require('../../utils/AppError');

async function listMethods(auth, query) {
  return paymentMethodRepository.list(auth.organizationId, query);
}

async function getMethod(auth, id) {
  const method = await paymentMethodRepository.findById(id, auth.organizationId);
  if (!method) throw new NotFoundError('Payment method not found');
  return method;
}

async function createMethod(auth, payload) {
  const slug = paymentMethodRepository.toSlug(payload.name);
  const existing = await paymentMethodRepository.findBySlug(auth.organizationId, slug);
  if (existing) throw new ConflictError('A payment method with this name already exists');

  return paymentMethodRepository.create({
    name: payload.name.trim(),
    isActive: payload.isActive !== false,
    organizationId: auth.organizationId,
  });
}

async function updateMethod(auth, id, payload) {
  await getMethod(auth, id);
  if (payload.name) {
    const slug = paymentMethodRepository.toSlug(payload.name);
    const existing = await paymentMethodRepository.findBySlug(auth.organizationId, slug);
    if (existing && existing._id.toString() !== id) {
      throw new ConflictError('A payment method with this name already exists');
    }
  }
  const method = await paymentMethodRepository.updateById(id, auth.organizationId, payload);
  if (!method) throw new NotFoundError('Payment method not found');
  return method;
}

async function deleteMethod(auth, id) {
  const method = await getMethod(auth, id);
  const used = await paymentMethodRepository.usageCount(auth.organizationId, method.name);
  if (used > 0) {
    throw new ConflictError('This payment method is in use and cannot be deleted');
  }
  await paymentMethodRepository.remove(id, auth.organizationId);
  return { deleted: true };
}

async function deleteMethods(auth, ids) {
  const methods = await Promise.all(ids.map((id) => paymentMethodRepository.findById(id, auth.organizationId)));
  for (const method of methods.filter(Boolean)) {
    const used = await paymentMethodRepository.usageCount(auth.organizationId, method.name);
    if (used > 0) {
      throw new ConflictError(`"${method.name}" is in use and cannot be deleted`);
    }
  }
  const deleted = await paymentMethodRepository.removeMany(ids, auth.organizationId);
  return { deleted };
}

async function assertActiveMethod(auth, name) {
  const method = await paymentMethodRepository.findActiveByName(auth.organizationId, name);
  if (!method) throw new NotFoundError('Payment method not found or inactive');
  return method.name;
}

module.exports = {
  listMethods,
  getMethod,
  createMethod,
  updateMethod,
  deleteMethod,
  deleteMethods,
  assertActiveMethod,
};
