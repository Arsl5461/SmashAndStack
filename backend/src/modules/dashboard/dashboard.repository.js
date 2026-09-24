const mongoose = require('mongoose');
const { Sale, Expense, Order, Store, PaymentMethod } = require('../../database/models');
const { scopedStoreFilter } = require('../../middleware/storeAccess.middleware');
const { dateTruncUnit } = require('../../utils/dateHelper');

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

function matchStage(auth, storeId, dateField, start, end) {
  const match = {
    organizationId: toObjectId(auth.organizationId),
    [dateField]: { $gte: start, $lte: end },
    ...scopedStoreFilter(auth, storeId),
  };

  if (match.storeId) {
    if (match.storeId.$in) {
      match.storeId = { $in: match.storeId.$in.map((id) => toObjectId(id)) };
    } else {
      match.storeId = toObjectId(match.storeId);
    }
  }

  return match;
}

function periodGroup(dateField, groupBy) {
  return {
    $dateTrunc: {
      date: `$${dateField}`,
      unit: dateTruncUnit(groupBy),
    },
  };
}

async function aggregateSales(auth, { storeId, start, end, groupBy }) {
  const match = matchStage(auth, storeId, 'saleDate', start, end);

  const [result] = await Sale.aggregate([
    { $match: match },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              saleCount: { $sum: 1 },
            },
          },
        ],
        byPeriod: [
          {
            $group: {
              _id: periodGroup('saleDate', groupBy),
              revenue: { $sum: '$totalAmount' },
            },
          },
          { $sort: { _id: 1 } },
        ],
        byStore: [
          {
            $group: {
              _id: '$storeId',
              revenue: { $sum: '$totalAmount' },
              sales: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: 'stores',
              localField: '_id',
              foreignField: '_id',
              as: 'store',
            },
          },
          { $unwind: { path: '$store', preserveNullAndEmptyArrays: true } },
        ],
        recent: [
          { $sort: { saleDate: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'stores',
              localField: 'storeId',
              foreignField: '_id',
              as: 'store',
            },
          },
          { $unwind: { path: '$store', preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

  return result || { totals: [], byPeriod: [], byStore: [], recent: [] };
}

async function aggregateExpenses(auth, { storeId, start, end, groupBy }) {
  const match = matchStage(auth, storeId, 'expenseDate', start, end);

  const [result] = await Expense.aggregate([
    { $match: match },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalExpenses: { $sum: '$amount' },
              expenseCount: { $sum: 1 },
            },
          },
        ],
        byPeriod: [
          {
            $group: {
              _id: periodGroup('expenseDate', groupBy),
              expenses: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              amount: { $sum: '$amount' },
            },
          },
          { $sort: { amount: -1 } },
        ],
        byStore: [
          {
            $group: {
              _id: '$storeId',
              expenses: { $sum: '$amount' },
            },
          },
          {
            $lookup: {
              from: 'stores',
              localField: '_id',
              foreignField: '_id',
              as: 'store',
            },
          },
          { $unwind: { path: '$store', preserveNullAndEmptyArrays: true } },
        ],
        topExpenses: [
          { $sort: { amount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'stores',
              localField: 'storeId',
              foreignField: '_id',
              as: 'store',
            },
          },
          { $unwind: { path: '$store', preserveNullAndEmptyArrays: true } },
        ],
        recent: [
          { $sort: { expenseDate: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'stores',
              localField: 'storeId',
              foreignField: '_id',
              as: 'store',
            },
          },
          { $unwind: { path: '$store', preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ]);

  return result || { totals: [], byPeriod: [], byCategory: [], byStore: [], topExpenses: [], recent: [] };
}

async function aggregateOrders(auth, { storeId, start, end }) {
  const match = matchStage(auth, storeId, 'orderDate', start, end);

  const [result] = await Order.aggregate([
    { $match: match },
    {
      $facet: {
        totals: [{ $group: { _id: null, totalOrders: { $sum: 1 } } }],
        byStore: [
          {
            $group: {
              _id: '$storeId',
              orders: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  return result || { totals: [], byStore: [] };
}

async function aggregateTenderTypes(auth, { storeId, start, end }) {
  const salesMatch = matchStage(auth, storeId, 'saleDate', start, end);
  const refundsMatch = {
    ...matchStage(auth, storeId, 'orderDate', start, end),
    paymentStatus: 'REFUNDED',
  };

  const [sales, refunds, methods] = await Promise.all([
    Sale.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'Unspecified'] },
          salesTotal: { $sum: '$totalAmount' },
        },
      },
    ]),
    Order.aggregate([
      { $match: refundsMatch },
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'Unspecified'] },
          refundTotal: { $sum: '$total' },
        },
      },
    ]),
    PaymentMethod.find({ organizationId: auth.organizationId, isActive: true }).select('name').sort({ name: 1 }),
  ]);

  const map = new Map();
  methods.forEach((method) => {
    map.set(method.name, { tenderType: method.name, salesTotal: 0, refundTotal: 0, amountCollected: 0 });
  });
  sales.forEach((row) => {
    const current = map.get(row._id) || { tenderType: row._id, salesTotal: 0, refundTotal: 0, amountCollected: 0 };
    current.salesTotal = Number(row.salesTotal || 0);
    map.set(row._id, current);
  });
  refunds.forEach((row) => {
    const current = map.get(row._id) || { tenderType: row._id, salesTotal: 0, refundTotal: 0, amountCollected: 0 };
    current.refundTotal = Number(row.refundTotal || 0);
    map.set(row._id, current);
  });

  const rows = Array.from(map.values())
    .map((row) => ({
      ...row,
      salesTotal: Number(row.salesTotal.toFixed(2)),
      refundTotal: Number(row.refundTotal.toFixed(2)),
      amountCollected: Number((row.salesTotal - row.refundTotal).toFixed(2)),
    }))
    .sort((a, b) => b.salesTotal - a.salesTotal);

  const totals = rows.reduce(
    (sum, row) => ({
      salesTotal: sum.salesTotal + row.salesTotal,
      refundTotal: sum.refundTotal + row.refundTotal,
      amountCollected: sum.amountCollected + row.amountCollected,
    }),
    { salesTotal: 0, refundTotal: 0, amountCollected: 0 }
  );

  return {
    rows,
    totals: {
      salesTotal: Number(totals.salesTotal.toFixed(2)),
      refundTotal: Number(totals.refundTotal.toFixed(2)),
      amountCollected: Number(totals.amountCollected.toFixed(2)),
    },
  };
}

async function countActiveStores(auth, storeId) {
  const filter = {
    organizationId: auth.organizationId,
    status: 'ACTIVE',
    deletedAt: null,
  };

  if (storeId) {
    filter._id = storeId;
  } else if (!auth.isSuperAdmin) {
    filter._id = { $in: auth.storeIds };
  }

  return Store.countDocuments(filter);
}

function money(value) {
  return Number((value || 0).toFixed(2));
}

function percent(part, whole) {
  return whole ? Number(((part / whole) * 100).toFixed(2)) : 0;
}

function matchesCategory(name, patterns) {
  const value = String(name || '').toLowerCase();
  return patterns.some((pattern) => value.includes(pattern));
}

async function aggregateIncomeExpenseStatement(auth, { storeId, start, end }) {
  const salesMatch = matchStage(auth, storeId, 'saleDate', start, end);
  const expenseMatch = matchStage(auth, storeId, 'expenseDate', start, end);

  const [salesByMethod, expenses] = await Promise.all([
    Sale.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'Unspecified'] },
          amount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]),
    Expense.find(expenseMatch).sort({ category: 1, expenseDate: 1, title: 1 }).lean(),
  ]);

  const totalSales = money(salesByMethod.reduce((sum, row) => sum + (row.amount || 0), 0));
  const totalExpenses = money(expenses.reduce((sum, row) => sum + (row.amount || 0), 0));
  const operatingProfit = money(totalSales - totalExpenses);
  const profitMargin = percent(operatingProfit, totalSales);

  const revenueSources = salesByMethod
    .map((row) => ({
      name: row._id,
      amount: money(row.amount),
      percentOfSales: percent(row.amount, totalSales),
      count: row.count,
    }))
    .filter((row) => row.amount > 0);

  const categoryMap = new Map();
  const methodMap = new Map();

  expenses.forEach((expense) => {
    const category = expense.category || 'Uncategorized';
    const method = expense.paymentMethod || 'Unspecified';
    const currentCategory = categoryMap.get(category) || { name: category, amount: 0, count: 0, items: [] };
    currentCategory.amount += expense.amount;
    currentCategory.count += 1;
    currentCategory.items.push({
      date: expense.expenseDate,
      payee: expense.title,
      paymentMethod: method,
      description: expense.description || '',
      amount: money(expense.amount),
      percentOfSales: percent(expense.amount, totalSales),
    });
    categoryMap.set(category, currentCategory);

    const currentMethod = methodMap.get(method) || { name: method, amount: 0, count: 0 };
    currentMethod.amount += expense.amount;
    currentMethod.count += 1;
    methodMap.set(method, currentMethod);
  });

  const expenseCategories = Array.from(categoryMap.values())
    .map((row) => ({
      name: row.name,
      amount: money(row.amount),
      percentOfExpenses: percent(row.amount, totalExpenses),
      percentOfSales: percent(row.amount, totalSales),
      count: row.count,
      items: row.items,
    }))
    .sort((a, b) => b.amount - a.amount);

  const expenseMethods = Array.from(methodMap.values())
    .map((row) => ({
      name: row.name,
      amount: money(row.amount),
      percentOfExpenses: percent(row.amount, totalExpenses),
      count: row.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const foodCost = money(
    expenseCategories
      .filter((row) => matchesCategory(row.name, ['food']))
      .reduce((sum, row) => sum + row.amount, 0)
  );
  const payroll = money(
    expenseCategories
      .filter((row) => matchesCategory(row.name, ['payroll', 'wage', 'labor', 'salary']))
      .reduce((sum, row) => sum + row.amount, 0)
  );
  const rentUtilities = money(
    expenseCategories
      .filter((row) => matchesCategory(row.name, ['rent', 'utilit']))
      .reduce((sum, row) => sum + row.amount, 0)
  );
  const primeCost = money(foodCost + payroll);

  return {
    totalSales,
    totalExpenses,
    operatingProfit,
    profitMargin,
    expenseCount: expenses.length,
    ratios: {
      foodCost: percent(foodCost, totalSales),
      payroll: percent(payroll, totalSales),
      primeCost: percent(primeCost, totalSales),
      rentUtilities: percent(rentUtilities, totalSales),
      foodCostAmount: foodCost,
      payrollAmount: payroll,
      primeCostAmount: primeCost,
      rentUtilitiesAmount: rentUtilities,
    },
    revenueSources,
    expenseCategories,
    expenseMethods,
  };
}

module.exports = {
  aggregateSales,
  aggregateExpenses,
  aggregateOrders,
  aggregateTenderTypes,
  aggregateIncomeExpenseStatement,
  countActiveStores,
};
