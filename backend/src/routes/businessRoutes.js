import { Router } from 'express';
import {
  getBusinesses,
  getNearbyBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getMyBusinesses,
  getCategories,
  discoverLivePlaces,
  importDiscoveredPlaces,
} from '../controllers/businessController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  businessCreateSchema,
  businessUpdateSchema,
} from '../validators/businessValidator.js';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/nearby', getNearbyBusinesses);
router.get('/live-discover', discoverLivePlaces);
router.get('/', optionalAuth, getBusinesses);
router.get('/my-listings', protect, authorize('business_owner', 'admin'), getMyBusinesses);
router.get('/:id', optionalAuth, getBusinessById);

// Owner/Admin protected routes
router.post('/import-places', protect, authorize('business_owner', 'admin'), importDiscoveredPlaces);

// Owner/Admin protected routes
router.post(
  '/',
  protect,
  authorize('business_owner', 'admin'),
  validate(businessCreateSchema),
  createBusiness
);

router.put(
  '/:id',
  protect,
  authorize('business_owner', 'admin'),
  validate(businessUpdateSchema),
  updateBusiness
);

router.delete(
  '/:id',
  protect,
  authorize('business_owner', 'admin'),
  deleteBusiness
);

export default router;
