import api from './axiosInstance';

export const adminAPI = {
  getCoins: (params) => api.get('/admin/coins', { params }),
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
};
