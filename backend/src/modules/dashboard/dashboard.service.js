const dashboardRepository = require('./dashboard.repository');
const {
  resolveDateRange,
  previousPeriod,
  growthPercentage,
  resolveGroupBy,
} = require('../../utils/dateHelper');

function firstTotal(rows, key, fallback = 0) {
  return rows?.[0]?.[key] ?? fallback;
}

function mergePeriods(revenueRows = [], expenseRows = []) {
  const map = new Map();

  revenueRows.forEach((row) => {
    const key = new Date(row._id).toISOString();
    map.set(key, {
      date: row._id,
      revenue: row.revenue || 0,
      expenses: 0,
    });
  });

  expenseRows.forEach((row) => {
    const key = new Date(row._id).toISOString();
    const current = map.get(key) || { date: row._id, revenue: 0, expenses: 0 };
    current.expenses = row.expenses || 0;
    map.set(key, current);
  });

  return [...map.values()]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((row) => ({
      date: row.date,
      revenue: Number(row.revenue.toFixed(2)),
      expenses: Number(row.expenses.toFixed(2)),
      netProfit: Number((row.revenue - row.expenses).toFixed(2)),
    }));
}

function mergeStorePerformance(salesByStore = [], expensesByStore = [], ordersByStore = []) {
  const map = new Map();

  salesByStore.forEach((row) => {
    map.set(String(row._id), {
      storeId: row._id,
      storeName: row.store?.name || 'Unknown store',
      storeCode: row.store?.storeCode || '',
      revenue: row.revenue || 0,
      expenses: 0,
      orders: 0,
    });
  });

  expensesByStore.forEach((row) => {
    const key = String(row._id);
    const current = map.get(key) || {
      storeId: row._id,
      storeName: row.store?.name || 'Unknown store',
      storeCode: row.store?.storeCode || '',
      revenue: 0,
      expenses: 0,
      orders: 0,
    };
    current.expenses = row.expenses || 0;
    map.set(key, current);
  });

  ordersByStore.forEach((row) => {
    const key = String(row._id);
    const current = map.get(key) || {
      storeId: row._id,
      storeName: 'Unknown store',
      storeCode: '',
      revenue: 0,
      expenses: 0,
      orders: 0,
    };
    current.orders = row.orders || 0;
    map.set(key, current);
  });

  return [...map.values()]
    .map((row) => ({
      ...row,
      profit: Number((row.revenue - row.expenses).toFixed(2)),
      revenue: Number(row.revenue.toFixed(2)),
      expenses: Number(row.expenses.toFixed(2)),
    }))
    .sort((a, b) => b.profit - a.profit)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

async function getOverview(auth, query = {}) {
  const range = resolveDateRange(query);
  const previous = previousPeriod(range);
  const groupBy = resolveGroupBy(
    query.groupBy ||
      (query.range === 'ytd' || query.range === '6m' ? 'month' : query.range === '3m' ? 'week' : 'day')
  );
  const storeId = query.storeId || null;
  const context = { storeId, start: range.start, end: range.end, groupBy };
  const previousContext = { storeId, start: previous.start, end: previous.end, groupBy };

  const [sales, expenses, orders, prevSales, prevExpenses, prevOrders, activeStores] = await Promise.all([
    dashboardRepository.aggregateSales(auth, context),
    dashboardRepository.aggregateExpenses(auth, context),
    dashboardRepository.aggregateOrders(auth, context),
    dashboardRepository.aggregateSales(auth, previousContext),
    dashboardRepository.aggregateExpenses(auth, previousContext),
    dashboardRepository.aggregateOrders(auth, previousContext),
    dashboardRepository.countActiveStores(auth, storeId),
  ]);

  const totalRevenue = firstTotal(sales.totals, 'totalRevenue');
  const totalExpenses = firstTotal(expenses.totals, 'totalExpenses');
  const totalOrders = firstTotal(orders.totals, 'totalOrders');
  const prevRevenue = firstTotal(prevSales.totals, 'totalRevenue');
  const prevExpenseTotal = firstTotal(prevExpenses.totals, 'totalExpenses');
  const prevOrderTotal = firstTotal(prevOrders.totals, 'totalOrders');
  const netProfit = totalRevenue - totalExpenses;
  const prevProfit = prevRevenue - prevExpenseTotal;

  const revenueVsExpense = mergePeriods(sales.byPeriod, expenses.byPeriod);
  const storePerformance = mergeStorePerformance(sales.byStore, expenses.byStore, orders.byStore);
  const expenseTotalForShare = totalExpenses || 1;

  const recentIncome = (sales.recent || []).map((item) => ({
    id: item._id,
    store: item.store?.name,
    description: item.customerName || 'Sale',
    category: item.paymentMethod,
    type: 'INCOME',
    amount: item.totalAmount,
    date: item.saleDate,
    status: 'COMPLETED',
  }));

  const recentExpense = (expenses.recent || []).map((item) => ({
    id: item._id,
    store: item.store?.name,
    description: item.title,
    category: item.category,
    type: 'EXPENSE',
    amount: item.amount,
    date: item.expenseDate,
    status: 'RECORDED',
  }));

  const recentTransactions = [...recentIncome, ...recentExpense]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    range: { start: range.start, end: range.end, groupBy },
    summary: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      totalOrders,
      activeStores,
      profitMargin: totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0,
      revenueGrowth: growthPercentage(totalRevenue, prevRevenue),
      expenseGrowth: growthPercentage(totalExpenses, prevExpenseTotal),
      profitGrowth: growthPercentage(netProfit, prevProfit),
      ordersGrowth: growthPercentage(totalOrders, prevOrderTotal),
    },
    revenueVsExpense,
    profitLossData: revenueVsExpense.map((row) => ({
      period: row.date,
      revenue: row.revenue,
      expenses: row.expenses,
      netProfit: row.netProfit,
    })),
    expenseBreakdown: (expenses.byCategory || []).map((row) => ({
      category: row._id,
      amount: Number(row.amount.toFixed(2)),
      percentage: Number(((row.amount / expenseTotalForShare) * 100).toFixed(1)),
    })),
    storePerformance,
    recentTransactions,
    topExpenses: (expenses.topExpenses || []).map((item) => ({
      id: item._id,
      title: item.title,
      category: item.category,
      store: item.store?.name,
      amount: item.amount,
      date: item.expenseDate,
    })),
  };
}

module.exports = {
  getOverview,
  mergeStorePerformance,
};
