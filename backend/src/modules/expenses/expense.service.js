const expenseRepository = require('./expense.repository');
const expenseCategoryService = require('../expenseCategories/expenseCategory.service');
const paymentMethodService = require('../paymentMethods/paymentMethod.service');
const { NotFoundError } = require('../../utils/AppError');
const { startOfDay } = require('../../utils/dateHelper');

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
  const paymentMethod = await paymentMethodService.assertActiveMethod(auth, payload.paymentMethod);
  return expenseRepository.create({
    ...payload,
    category,
    paymentMethod,
    receiptUrl,
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    expenseDate: payload.expenseDate ? startOfDay(payload.expenseDate) : new Date(),
  });
}

async function updateExpense(auth, id, payload, receiptUrl) {
  await getExpense(auth, id);
  const update = { ...payload };
  if (payload.category) update.category = await expenseCategoryService.assertActiveCategory(auth, payload.category);
  if (payload.paymentMethod) {
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
