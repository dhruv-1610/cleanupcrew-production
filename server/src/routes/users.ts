import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { User } from '../models/user.model';
import { Donation } from '../models/donation.model';
import * as badgeService from '../services/badge.service';
import { authorize } from '../middleware/authorize';
import { ForbiddenError, BadRequestError } from '../utils/errors';

const router = Router();

/** PATCH /api/users/me — Update authenticated user's profile (must be before /:userId routes). */
router.patch(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const user = await User.findById(userId);
      if (!user) {
        throw new BadRequestError('User not found');
      }

      const { name, email, phone, emergencyContact, medicalNotes } = req.body as any;

      if (name && typeof name === 'string') {
        user.profile.name = name.trim();
      }
      if (phone && typeof phone === 'string') {
        user.profile.phone = phone.trim();
      }
      if (emergencyContact && typeof emergencyContact === 'object') {
        user.profile.emergencyContact = {
          name: emergencyContact.name || '',
          phone: emergencyContact.phone || ''
        };
      }
      if (medicalNotes !== undefined) {
        user.profile.medicalNotes = String(medicalNotes).trim();
      }
      
      if (email && typeof email === 'string') {
        // Check for duplicate email
        const existing = await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: user._id },
        });
        if (existing) {
          throw new BadRequestError('Email already in use');
        }
        user.email = email.toLowerCase().trim();
      }

      await user.save();

      // Return user without passwordHash
      const userObj = user.toObject();
      const { passwordHash: _, ...safeUser } = userObj;
      res.json({ user: safeUser });
    } catch (error) {
      next(error);
    }
  },
);

/** GET /api/users/me/donations — Returns authenticated user's donations (must be before /:userId). */
router.get(
  '/me/donations',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const donations = await Donation.find({ userId: req.user!.userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({ donations });
    } catch (error) {
      next(error);
    }
  },
);

/** GET /api/users — Admin lists all users. */
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find({})
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  },
);

/** PATCH /api/users/:userId/role — Admin changes a user's role. */
router.patch(
  '/:userId/role',
  authenticate,
  authorize(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const { role } = req.body as { role?: string };
      if (!role || !['public', 'user', 'organizer', 'admin'].includes(role)) {
        throw new BadRequestError('Invalid role. Must be public, user, organizer, or admin');
      }
      const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash');
      if (!user) throw new BadRequestError('User not found');
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
);

/** DELETE /api/users/:userId — Admin deletes a user. */
router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      if (userId === req.user!.userId) {
        throw new BadRequestError('Cannot delete your own account');
      }
      const deleted = await User.findByIdAndDelete(userId);
      if (!deleted) throw new BadRequestError('User not found');
      res.json({ message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  },
);

/** GET /api/users/:userId/badges — Badge levels for a user. */
router.get('/:userId/badges', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const badges = await badgeService.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    next(error);
  }
});

/** GET /api/users/:userId/certificate — PDF certificate (own or admin). */
router.get(
  '/:userId/certificate',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const isAdmin = req.user!.role === 'admin';
      const isOwn = req.user!.userId === userId;

      if (!isAdmin && !isOwn) {
        throw new ForbiddenError('You can only request your own certificate');
      }

      const { generateCertificate } = await import('../services/certificate.service');
      const pdf = await generateCertificate(userId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
