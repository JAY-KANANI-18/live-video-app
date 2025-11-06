import { Router } from 'express';
import authRoutes from './auth';
import agencyRoutes from './agency';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API',
    timestamp: new Date().toISOString(),
  });
});

// API v1 routes
router.get('/v1/status', (req, res) => {
  res.json({
    version: '1.1.0',
    status: 'active',
    features: ['auth', 'agency'],
  });
});

// Auth routes
router.use('/v1/auth', authRoutes);

// Agency routes
router.use('/v1/agency', agencyRoutes);

// TODO: Add more route modules
// router.use('/v1/users', userRoutes);
// router.use('/v1/calls', callRoutes);
// router.use('/v1/gifts', giftRoutes);
// router.use('/v1/payments', paymentRoutes);

export default router;
