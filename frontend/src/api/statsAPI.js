import api from './axiosInstance';

export const statsAPI = {
  marketCap: () => api.get('/stats/market-cap'),
  averagePrice: () => api.get('/stats/average-price'),
  averageVolume: () => api.get('/stats/average-volume'),
  highestMarketCap: () => api.get('/stats/highest-market-cap'),
  highestVolume: () => api.get('/stats/highest-volume'),
  topGainers: (params) => api.get('/stats/top-gainers', { params }),
  topLosers: (params) => api.get('/stats/top-losers', { params }),
  monthlyAnalysis: () => api.get('/stats/monthly-analysis'),
  coinCount: () => api.get('/stats/coin-count'),
  rankDistribution: () => api.get('/stats/rank-distribution'),
  priceDistribution: () => api.get('/stats/price-distribution'),
  volatilityDistribution: () => api.get('/stats/volatility-distribution'),
  marketSummary: () => api.get('/stats/market-summary'),
  dailyAnalysis: () => api.get('/stats/daily-analysis'),
  yearlyAnalysis: () => api.get('/stats/yearly-analysis'),
};
