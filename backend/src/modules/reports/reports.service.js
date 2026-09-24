const dashboardService = require('../dashboard/dashboard.service');
const dashboardRepository = require('../dashboard/dashboard.repository');
const { resolveDateRange } = require('../../utils/dateHelper');

async function profitLoss(auth, query) {
  const overview = await dashboardService.getOverview(auth, query);
  return {
    range: overview.range,
    summary: {
      grossRevenue: overview.summary.totalRevenue,
      totalExpenses: overview.summary.totalExpenses,
      netProfit: overview.summary.netProfit,
      profitMargin: overview.summary.profitMargin,
    },
    series: overview.profitLossData,
    expenseBreakdown: overview.expenseBreakdown,
  };
}

async function storeComparison(auth, query) {
  const overview = await dashboardService.getOverview(auth, {
    ...query,
    storeId: undefined,
  });
  return {
    range: overview.range,
    stores: overview.storePerformance,
    ranking: overview.storePerformance.slice(0, 5),
  };
}

function monthBounds(month) {
  const now = new Date();
  const value = typeof month === 'string' && /^\d{4}-\d{2}$/.test(month) ? month : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [year, monthIndex] = value.split('-').map(Number);
  const start = new Date(year, monthIndex - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
  return { month: value, start, end };
}

async function tenderTypes(auth, query) {
  const range =
    query.startDate && query.endDate
      ? resolveDateRange({ range: 'custom', startDate: query.startDate, endDate: query.endDate })
      : monthBounds(query.month);
  const data = await dashboardRepository.aggregateTenderTypes(auth, {
    storeId: query.storeId,
    start: range.start,
    end: range.end,
  });
  return {
    month: range.month,
    start: range.start,
    end: range.end,
    ...data,
  };
}

async function incomeExpenseStatement(auth, query) {
  const range =
    query.startDate && query.endDate
      ? resolveDateRange({ range: 'custom', startDate: query.startDate, endDate: query.endDate })
      : monthBounds(query.month);
  const data = await dashboardRepository.aggregateIncomeExpenseStatement(auth, {
    storeId: query.storeId,
    start: range.start,
    end: range.end,
  });
  return {
    start: range.start,
    end: range.end,
    ...data,
  };
}

module.exports = { profitLoss, storeComparison, tenderTypes, incomeExpenseStatement };
