const expenseRepository = require('./expense.repository');
const expenseCategoryService = require('../expenseCategories/expenseCategory.service');
const paymentMethodService = require('../paymentMethods/paymentMethod.service');
const { NotFoundError, ValidationError } = require('../../utils/AppError');
const { startOfDay } = require('../../utils/dateHelper');

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

async function normalizePaymentMethods(auth, rows = []) {
  if (!Array.isArray(rows) || !rows.length) {
    throw new ValidationError('Add at least one payment method');
  }

  const normalized = [];
  for (const row of rows) {
    const method = await paymentMethodService.assertActiveMethod(auth, row.method);
    const amount = money(row.amount);
    if (amount <= 0) {
      throw new ValidationError('Each payment method amount must be greater than zero');
    }
    normalized.push({ method, amount });
  }

  const total = money(normalized.reduce((sum, row) => sum + row.amount, 0));
  return {
    paymentMethods: normalized,
    amount: total,
    paymentMethod: normalized.map((row) => row.method).join(', '),
  };
}

async function listExpenses(auth, query) {
  return expenseRepository.list(auth, query);
}

async function getExpense(auth, id) {
  const expense = await expenseRepository.findById(id, auth.organizationId);
  if (!expense) throw new NotFoundError('Expense not found');
  return expense;
}

async function createExpense(auth, payload, receiptUrl = '') {
  const category = await expenseCategoryService.assertActiveCategory(auth, payload.category);
  const payments = await normalizePaymentMethods(auth, payload.paymentMethods);
  const title = String(payload.title || '').trim() || category;

  return expenseRepository.create({
    storeId: payload.storeId,
    title,
    description: payload.description || '',
    category,
    ...payments,
    receiptUrl,
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    expenseDate: payload.expenseDate ? startOfDay(payload.expenseDate) : new Date(),
  });
}

async function updateExpense(auth, id, payload, receiptUrl) {
  await getExpense(auth, id);
  const update = { ...payload };

  if (payload.title !== undefined) {
    const nextTitle = String(payload.title || '').trim();
    if (!nextTitle) throw new ValidationError('Title is required');
    update.title = nextTitle;
  }
  if (payload.category) {
    update.category = await expenseCategoryService.assertActiveCategory(auth, payload.category);
  }
  if (payload.paymentMethods) {
    Object.assign(update, await normalizePaymentMethods(auth, payload.paymentMethods));
  } else if (payload.paymentMethod) {
    update.paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  }
  if (payload.expenseDate) update.expenseDate = startOfDay(payload.expenseDate);
  if (receiptUrl) update.receiptUrl = receiptUrl;

  return expenseRepository.updateById(id, auth.organizationId, update);
}

async function deleteExpense(auth, id) {
  const expense = await expenseRepository.remove(id, auth.organizationId);
  if (!expense) throw new NotFoundError('Expense not found');
  return { deleted: true };
}

async function deleteExpenses(auth, ids) {
  const deleted = await expenseRepository.removeMany(ids, auth);
  return { deleted };
}

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense, deleteExpenses };
