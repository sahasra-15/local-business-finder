import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorite,
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getFavorites);
router.get('/check/:businessId', checkIsFavorite);
router.post('/:businessId', addFavorite);
router.delete('/:businessId', removeFavorite);

export default router;
