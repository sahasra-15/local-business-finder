import { Router } from 'express';
import {
  getReviewsByBusiness,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewCreateSchema, reviewUpdateSchema } from '../validators/reviewValidator.js';

const router = Router();

router.get('/business/:businessId', getReviewsByBusiness);
router.post('/business/:businessId', protect, validate(reviewCreateSchema), createReview);
router.put('/:id', protect, validate(reviewUpdateSchema), updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
