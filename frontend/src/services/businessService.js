import api from './api';

export const businessService = {
  getBusinesses: (params = {}) => api.get('/businesses', { params }),
  getNearbyBusinesses: (params = {}) => api.get('/businesses/nearby', { params }),
  getBusinessById: (id, params = {}) => api.get(`/businesses/${id}`, { params }),
  getCategories: () => api.get('/businesses/categories'),
  getMyBusinesses: () => api.get('/businesses/my-listings'),
  createBusiness: (data) => api.post('/businesses', data),
  updateBusiness: (id, data) => api.put(`/businesses/${id}`, data),
  deleteBusiness: (id) => api.delete(`/businesses/${id}`),
};
