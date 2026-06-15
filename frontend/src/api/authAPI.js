import api from './axiosInstance';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  deleteProfile: () => api.delete('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  getJwtProfile: () => api.get('/jwt/profile'),
  getJwtDashboard: () => api.get('/jwt/dashboard'),
  generateToken: () => api.post('/jwt/generate-token'),
  verifyToken: (data) => api.post('/jwt/verify-token', data),
  getJwtAdmin: () => api.get('/jwt/admin'),
  getPrivateStats: () => api.get('/jwt/private-stats'),
  refreshToken: () => api.post('/jwt/refresh-token'),
  revokeToken: () => api.delete('/jwt/revoke-token'),
};
