/**
 * @param {number} totalCount
 * @param {number} page
 * @param {number} limit
 */
const buildPagination = (totalCount, page, limit) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const totalPages = Math.ceil(totalCount / safeLimit) || 1;

  return {
    currentPage: safePage,
    totalPages,
    totalRecords: totalCount,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    limit: safeLimit,
  };
};

module.exports = { buildPagination };
