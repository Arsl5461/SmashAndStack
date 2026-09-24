const orderRepository = require('./order.repository');
const paymentMethodService = require('../paymentMethods/paymentMethod.service');
const { NotFoundError, ValidationError } = require('../../utils/AppError');

function computeItems(items = []) {
  if (!items.length) throw new ValidationError('At least one item is required');
  const lines = items.map((item) => ({
    ...item,
    total: Number((item.quantity * item.price).toFixed(2)),
  }));
  const total = Number(lines.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  return { lines, total };
}

async function listOrders(auth, query) {
  return orderRepository.list(auth, query);
}

async function getOrder(auth, id) {
  const order = await orderRepository.findById(id, auth.organizationId);
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

async function createOrder(auth, payload) {
  const { lines, total } = computeItems(payload.items);
  const orderNumber = await orderRepository.nextOrderNumber(auth.organizationId);
  if (payload.paymentMethod) {
    payload.paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  }
  return orderRepository.create({
    ...payload,
    items: lines,
    total,
    orderNumber,
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    orderDate: payload.orderDate ? new Date(payload.orderDate) : new Date(),
  });
}

async function updateOrder(auth, id, payload) {
  await getOrder(auth, id);
  const update = { ...payload };
  if (payload.items) {
    const computed = computeItems(payload.items);
    update.items = computed.lines;
    update.total = computed.total;
  }
  if (payload.paymentMethod) {
    update.paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  }
  if (payload.orderDate) update.orderDate = new Date(payload.orderDate);
  return orderRepository.updateById(id, auth.organizationId, update);
}

async function deleteOrder(auth, id) {
  const order = await orderRepository.remove(id, auth.organizationId);
  if (!order) throw new NotFoundError('Order not found');
  return { deleted: true };
}

async function deleteOrders(auth, ids) {
  const deleted = await orderRepository.removeMany(ids, auth);
  return { deleted };
}

module.exports = { listOrders, getOrder, createOrder, updateOrder, deleteOrder, deleteOrders };
