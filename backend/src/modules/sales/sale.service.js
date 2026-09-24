const saleRepository = require('./sale.repository');
const paymentMethodService = require('../paymentMethods/paymentMethod.service');
const { NotFoundError, ValidationError } = require('../../utils/AppError');

function computeLines(products = [], totalAmount) {
  if (products.length) {
    const lines = products.map((item) => ({
      ...item,
      total: Number((item.quantity * item.price).toFixed(2)),
    }));
    return {
      lines,
      totalAmount: Number(lines.reduce((sum, item) => sum + item.total, 0).toFixed(2)),
    };
  }

  const amount = Number(totalAmount);
  if (!amount || amount <= 0) {
    throw new ValidationError('Sale amount is required');
  }

  return {
    lines: [{ name: 'Sale', quantity: 1, price: amount, total: amount }],
    totalAmount: Number(amount.toFixed(2)),
  };
}

async function listSales(auth, query) {
  return saleRepository.list(auth, query);
}

async function getSale(auth, id) {
  const sale = await saleRepository.findById(id, auth.organizationId);
  if (!sale) throw new NotFoundError('Sale not found');
  return sale;
}

async function createSale(auth, payload) {
  const { lines, totalAmount } = computeLines(payload.products, payload.totalAmount);
  const paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  return saleRepository.create({
    ...payload,
    paymentMethod,
    products: lines,
    totalAmount,
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    saleDate: payload.saleDate ? new Date(payload.saleDate) : new Date(),
  });
}

async function updateSale(auth, id, payload) {
  await getSale(auth, id);
  const update = { ...payload };
  if (payload.products) {
    const computed = computeLines(payload.products, payload.totalAmount);
    update.products = computed.lines;
    update.totalAmount = computed.totalAmount;
  }
  if (payload.paymentMethod) {
    update.paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  }
  if (payload.saleDate) update.saleDate = new Date(payload.saleDate);
  return saleRepository.updateById(id, auth.organizationId, update);
}

async function deleteSale(auth, id) {
  const sale = await saleRepository.remove(id, auth.organizationId);
  if (!sale) throw new NotFoundError('Sale not found');
  return { deleted: true };
}

async function deleteSales(auth, ids) {
  const deleted = await saleRepository.removeMany(ids, auth);
  return { deleted };
}

module.exports = { listSales, getSale, createSale, updateSale, deleteSale, deleteSales };
