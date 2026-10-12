import api from './api';

export const favoriteService = {
  getFavorites: () => api.get('/favorites'),
  add: (businessId) => api.post(`/favorites/${businessId}`),
  remove: (businessId) => api.delete(`/favorites/${businessId}`),
  check: (businessId) => api.get(`/favorites/check/${businessId}`),
};
