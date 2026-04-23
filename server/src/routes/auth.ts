import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema, refreshSchema } from '../validation/auth.validation';
import * as authService from '../services/auth.service';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { User } from '../models/user.model';
import { BadRequestError } from '../utils/errors';
import { env } from '../config/env';

const router = Router();

// ── Auth-specific rate limiter (stricter than global) ──────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many auth attempts, please try again later' } },
});

router.use(authLimiter);

// ── POST /auth/register ────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const { email, password, name } = parsed.data;
    const { verificationToken } = await authService.registerUser(email, password, name);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      verificationToken,
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /auth/verify-email?token=xxx ───────────────────────────────────────

router.get('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token;
    if (typeof token !== 'string' || !token) {
      throw new BadRequestError('Verification token is required');
    }

    await authService.verifyEmail(token);

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/login ───────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const { email, password } = parsed.data;
    const tokens = await authService.loginUser(email, password);

    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// ── POST /auth/refresh ─────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const result = await authService.refreshAccessToken(parsed.data.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ── GET /auth/me (protected) ───────────────────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId).select('-passwordHash');
    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Import models for enrichment
    const { Attendance } = await import('../models/attendance.model');
    const { Donation } = await import('../models/donation.model');
    const { Impact } = await import('../models/impact.model');
    const mongoose = await import('mongoose');
    const userObjId = new mongoose.Types.ObjectId(req.user!.userId);

    // Get user's booked/attended drives
    const attendances = await Attendance.find({
      userId: userObjId,
      status: { $in: ['booked', 'checked_in'] },
    }).lean();
    const driveIds = attendances.map((a) => a.driveId.toString());
    const checkedInCount = attendances.filter((a) => a.status === 'checked_in').length;

    // Get user's completed donations
    const donations = await Donation.find({
      userId: userObjId,
      status: 'completed',
    }).lean();
    const donationList = donations.map((d) => ({
      driveId: d.driveId.toString(),
      amount: d.amount,
    }));

    // Get badges from badge service
    const badgeService = await import('../services/badge.service');
    const badges = await badgeService.getUserBadges(req.user!.userId);

    // Calculate volunteer stats from impacts of drives user participated in
    let totalWaste = 0;
    if (driveIds.length > 0) {
      const impacts = await Impact.find({
        driveId: { $in: driveIds.map((id) => new mongoose.Types.ObjectId(id)) },
      }).lean();
      totalWaste = impacts.reduce((sum, imp) => sum + (imp.wasteCollected ?? 0), 0);
    }

    // Build the enriched user object matching frontend expectations
    const enrichedUser = {
      id: user._id.toString(),
      name: user.profile?.name ?? user.email.split('@')[0],
      email: user.email,
      role: user.role,
      drives: driveIds, // backward compatibility
      attendances: attendances.map(a => ({
        driveId: a.driveId.toString(),
        qrCode: a.qrCode,
        status: a.status,
        role: a.role
      })),
      donations: donationList,
      badges: [badges.volunteerBadge, badges.donorBadge].filter((b) => b !== 'None'),
      points: checkedInCount * 100 + donations.length * 50,
      rank: 0, // Can be computed from leaderboard if needed
      hoursVolunteered: user.stats?.volunteerHours ?? checkedInCount * 4,
      wasteCollected: totalWaste,
      joinedDate: user.createdAt?.toISOString?.()?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    };

    res.json({ user: enrichedUser });
  } catch (error) {
    next(error);
  }
});

// ── GET /auth/admin/stats (admin only) ─────────────────────────────────────

router.get(
  '/admin/stats',
  authenticate,
  authorize(['admin']),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userCount = await User.countDocuments();
      res.json({ userCount });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
