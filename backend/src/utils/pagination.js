function parseListQuery(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy,
    sortOrder,
    sort: { [sortBy]: sortOrder },
    search,
    storeId: query.storeId || undefined,
    category: query.category || undefined,
    status: query.status || undefined,
    paymentMethod: query.paymentMethod || undefined,
    startDate: query.startDate || undefined,
    endDate: query.endDate || undefined,
    roleId: query.roleId || undefined,
  };
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  parseListQuery,
  buildMeta,
  escapeRegex,
};
