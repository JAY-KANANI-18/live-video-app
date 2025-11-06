import { Router } from 'express';
import authRoutes from './auth';
import agencyRoutes from './agency';
import walletRoutes from './wallet';
import adminRoutes from './admin';
import chatRoutes from './chat';

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
    version: '1.2.0',
    status: 'active',
    milestone: 'Milestone 2 - Wallet & Payments',
    features: ['auth', 'agency', 'wallet', 'payments', 'admin'],
  });
});

// Auth routes
router.use('/v1/auth', authRoutes);

// Agency routes
router.use('/v1/agency', agencyRoutes);

router.use('/v1/wallet', walletRoutes);

// Admin routes
router.use('/v1/admin', adminRoutes);

// Chat routes
router.use('/v1/chat', chatRoutes);

// TODO: Add more route modules
// router.use('/v1/users', userRoutes);
// router.use('/v1/calls', callRoutes);
// router.use('/v1/gifts', giftRoutes);

export default router;
