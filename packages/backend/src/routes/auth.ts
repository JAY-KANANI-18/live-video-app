import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/prisma';

const router = Router();

/**
 * POST /auth/send-otp
 * Send OTP for signup/login
 */
router.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber, type = 'LOGIN' } = req.body;
    
    const result = await authService.sendOTP(email, phoneNumber, type);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/signup
 * Register new user
 */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber, username, displayName, dateOfBirth, password } = req.body;
    
    const user = await authService.signup({
      email,
      phoneNumber,
      username,
      displayName,
      dateOfBirth,
      password,
    });
    
    res.status(201).json({
      message: 'User registered successfully. Please verify with OTP to login.',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login with OTP
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber, otp } = req.body;
    
    const result = await authService.loginWithOTP({
      email,
      phoneNumber,
      otp,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Logout (invalidate refresh token)
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }
    
    const result = await authService.logout(refreshToken);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        wallet: true,
        agency: true,
        hostProfile: true,
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        role: user.role,
        status: user.status,
        isHost: user.isHost,
        agencyId: user.agencyId,
        agency: user.agency,
        level: user.level,
        experience: user.experience,
        diamonds: user.diamonds,
        wallet: user.wallet,
        hostProfile: user.hostProfile,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const {
      displayName,
      avatar,
      bio,
      gender,
      country,
      dateOfBirth,
    } = req.body;
    
    // Validate date of birth if provided
    if (dateOfBirth) {
      const { isValidAge } = await import('../utils/validation');
      if (!isValidAge(new Date(dateOfBirth))) {
        throw new AppError('You must be at least 18 years old', 400);
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        displayName,
        avatar,
        bio,
        gender,
        country,
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
      },
      include: {
        wallet: true,
        agency: true,
        hostProfile: true,
      },
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        country: updatedUser.country,
        role: updatedUser.role,
        isHost: updatedUser.isHost,
        agencyId: updatedUser.agencyId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
