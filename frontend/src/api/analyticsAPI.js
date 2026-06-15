import api from './axiosInstance';

export const analyticsAPI = {
  priceHighest: () => api.get('/analytics/price/highest'),
  priceLowest: () => api.get('/analytics/price/lowest'),
  priceAverage: () => api.get('/analytics/price/average'),
  priceHistory: (coinId) => api.get(`/analytics/price/history/${coinId}`),
  priceTrend: () => api.get('/analytics/price/trend'),
  priceGrowth: () => api.get('/analytics/price/growth'),
  priceDrop: () => api.get('/analytics/price/drop'),
  volumeHighest: () => api.get('/analytics/volume/highest'),
  volumeLowest: () => api.get('/analytics/volume/lowest'),
  volumeAverage: () => api.get('/analytics/volume/average'),
  volumeSpike: () => api.get('/analytics/volume/spike'),
  returnsTop: () => api.get('/analytics/returns/top'),
  returnsNegative: () => api.get('/analytics/returns/negative'),
  returnsCumulative: () => api.get('/analytics/returns/cumulative'),
  volatilityHigh: () => api.get('/analytics/volatility/high'),
};
