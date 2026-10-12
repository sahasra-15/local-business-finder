import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getBusinesses: (params = {}) => api.get('/admin/businesses', { params }),
  updateBusinessStatus: (id, data) => api.patch(`/admin/businesses/${id}/status`, data),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getReviews: (params = {}) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  getDuplicates: () => api.get('/admin/duplicates'),
};
