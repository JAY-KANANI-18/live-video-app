import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/jwt';

const router = Router();

/**
 * POST /agency/join
 * Join an agency using agency code
 */
router.post('/join', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { agencyCode } = req.body;
    
    if (!agencyCode) {
      throw new AppError('Agency code is required', 400);
    }
    
    // Find agency by code
    const agency = await prisma.agency.findUnique({
      where: { code: agencyCode },
    });
    
    if (!agency) {
      throw new AppError('Invalid agency code', 404);
    }
    
    if (!agency.isActive) {
      throw new AppError('This agency is not currently active', 400);
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user is already in an agency
    if (user.agencyId) {
      throw new AppError('You are already part of an agency', 400);
    }
    
    // Update user with agency
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyId: agency.id,
        isHost: true, // Mark as host when joining agency
      },
      include: {
        agency: true,
        wallet: true,
      },
    });
    
    // Update agency host count
    await prisma.agency.update({
      where: { id: agency.id },
      data: {
        totalHosts: {
          increment: 1,
        },
      },
    });
    
    // Generate new access token with agencyId claim
    const newAccessToken = generateAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email || undefined,
      phoneNumber: updatedUser.phoneNumber || undefined,
      role: updatedUser.role,
      isHost: updatedUser.isHost,
      agencyId: updatedUser.agencyId || undefined,
    });
    
    res.json({
      message: 'Successfully joined agency',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        isHost: updatedUser.isHost,
        agencyId: updatedUser.agencyId,
        agency: updatedUser.agency,
      },
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /agency/leave
 * Leave current agency
 */
router.post('/leave', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { agency: true },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    if (!user.agencyId) {
      throw new AppError('You are not part of any agency', 400);
    }
    
    const agencyId = user.agencyId;
    
    // Remove user from agency
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyId: null,
      },
    });
    
    // Update agency host count
    await prisma.agency.update({
      where: { id: agencyId },
      data: {
        totalHosts: {
          decrement: 1,
        },
      },
    });
    
    // Generate new access token without agencyId
    const newAccessToken = generateAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email || undefined,
      phoneNumber: updatedUser.phoneNumber || undefined,
      role: updatedUser.role,
      isHost: updatedUser.isHost,
      agencyId: undefined,
    });
    
    res.json({
      message: 'Successfully left agency',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        isHost: updatedUser.isHost,
        agencyId: null,
      },
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /agency/info
 * Get current agency info
 */
router.get('/info', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    if (!req.user.agencyId) {
      throw new AppError('You are not part of any agency', 404);
    }
    
    const agency = await prisma.agency.findUnique({
      where: { id: req.user.agencyId },
      include: {
        hosts: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isHost: true,
          },
        },
      },
    });
    
    if (!agency) {
      throw new AppError('Agency not found', 404);
    }
    
    res.json({
      agency: {
        id: agency.id,
        name: agency.name,
        code: agency.code,
        email: agency.email,
        phoneNumber: agency.phoneNumber,
        commissionRate: agency.commissionRate,
        totalHosts: agency.totalHosts,
        totalEarnings: agency.totalEarnings,
        isActive: agency.isActive,
        createdAt: agency.createdAt,
        hosts: agency.hosts,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /agency/list
 * List all active agencies (public)
 */
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agencies = await prisma.agency.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        totalHosts: true,
        commissionRate: true,
        createdAt: true,
      },
      orderBy: {
        totalHosts: 'desc',
      },
    });
    
    res.json({
      agencies,
      count: agencies.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
