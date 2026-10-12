import { Router } from 'express';
import {
  getPlatformStats,
  getAdminBusinesses,
  updateBusinessStatus,
  getAllUsers,
  getAllReviews,
  deleteAdminReview,
  getDuplicateBusinesses,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

// Require authenticated user with admin role
router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/businesses', getAdminBusinesses);
router.patch('/businesses/:id/status', updateBusinessStatus);
router.get('/users', getAllUsers);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteAdminReview);
router.get('/duplicates', getDuplicateBusinesses);

export default router;
