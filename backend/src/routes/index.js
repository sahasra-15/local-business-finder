import { Router } from 'express';
import authRoutes from './authRoutes.js';
import businessRoutes from './businessRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Local Business Finder API',
  });
});

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/admin', adminRoutes);

export default router;
