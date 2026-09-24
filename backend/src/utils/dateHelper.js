const { DATE_RANGES, GROUP_BY } = require('../constants/enums');

function parseLocalDate(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(date);
}

function startOfDay(date) {
  const value = parseLocalDate(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = parseLocalDate(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function resolveDateRange({ range, startDate, endDate }) {
  const now = new Date();
  const end = endDate ? endOfDay(endDate) : endOfDay(now);
  let start;

  switch (range) {
    case DATE_RANGES.LAST_7_DAYS:
      start = startOfDay(new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000));
      break;
    case DATE_RANGES.LAST_3_MONTHS:
      start = startOfDay(new Date(end));
      start.setMonth(start.getMonth() - 3);
      break;
    case DATE_RANGES.LAST_6_MONTHS:
      start = startOfDay(new Date(end));
      start.setMonth(start.getMonth() - 6);
      break;
    case DATE_RANGES.THIS_YEAR:
      start = new Date(end.getFullYear(), 0, 1);
      break;
    case DATE_RANGES.CUSTOM:
      start = startDate ? startOfDay(startDate) : startOfDay(new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000));
      break;
    case DATE_RANGES.LAST_30_DAYS:
    default:
      start = startDate ? startOfDay(startDate) : startOfDay(new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000));
      break;
  }

  if (startDate && endDate && range === DATE_RANGES.CUSTOM) {
    return { start: startOfDay(startDate), end: endOfDay(endDate) };
  }

  return { start, end };
}

function previousPeriod({ start, end }) {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

function growthPercentage(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function resolveGroupBy(groupBy) {
  const allowed = Object.values(GROUP_BY);
  return allowed.includes(groupBy) ? groupBy : GROUP_BY.DAY;
}

function dateTruncUnit(groupBy) {
  const resolved = resolveGroupBy(groupBy);
  if (resolved === GROUP_BY.QUARTER) {
    return 'month';
  }
  return resolved;
}

module.exports = {
  startOfDay,
  endOfDay,
  resolveDateRange,
  previousPeriod,
  growthPercentage,
  resolveGroupBy,
  dateTruncUnit,
};
