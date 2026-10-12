import api from './api';

export const reviewService = {
  getByBusiness: (businessId, params = {}) => api.get(`/reviews/business/${businessId}`, { params }),
  create: (businessId, data) => api.post(`/reviews/business/${businessId}`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
