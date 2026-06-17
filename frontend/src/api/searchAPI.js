import api from './axiosInstance';

export const searchAPI = {
  searchCoins: (params) => api.get('/search/coins', { params }),
};
