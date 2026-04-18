import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../config/upload';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import * as expenseService from '../services/expense.service';
import { BadRequestError } from '../utils/errors';

const router = Router();

/** Multer wrapper for expense proof upload */
function uploadProof(req: Request, res: Response, next: NextFunction): void {
  const single = upload.single('proof');
  single(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return next(new BadRequestError(err.message));
    }
    if (err) return next(err);
    next();
  });
}

/** GET /api/expenses — Admin lists all expenses. */
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { Expense } = await import('../models/expense.model');
      const expenses = await Expense.find({}).sort({ createdAt: -1 }).populate('driveId', 'title').lean();
      res.json({ expenses });
    } catch (error) {
      next(error);
    }
  },
);

/** POST /api/expenses — Admin creates a new expense. */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  uploadProof,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { driveId, category, amount } = req.body;
      if (!driveId || !category || !amount) {
        throw new BadRequestError('driveId, category, and amount are required');
      }

      const proofUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.proofUrl || '/uploads/no-proof.png');

      const { Expense } = await import('../models/expense.model');
      const expense = await Expense.create({
        driveId,
        category,
        amount: Number(amount),
        proofUrl,
        isVerified: false,
      });
      res.status(201).json({ expense });
    } catch (error) {
      next(error);
    }
  },
);

/** DELETE /api/expenses/:expenseId — Admin deletes an expense. */
router.delete(
  '/:expenseId',
  authenticate,
  authorize(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expenseId = Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId;
      const { Expense } = await import('../models/expense.model');
      const deleted = await Expense.findByIdAndDelete(expenseId);
      if (!deleted) throw new BadRequestError('Expense not found');
      res.json({ message: 'Expense deleted' });
    } catch (error) {
      next(error);
    }
  },
);

/** PATCH /api/expenses/:expenseId/verify — Admin marks expense as verified. */
router.patch(
  '/:expenseId/verify',
  authenticate,
  authorize(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expenseId = Array.isArray(req.params.expenseId)
        ? req.params.expenseId[0]
        : req.params.expenseId;

      const expense = await expenseService.verifyExpense(expenseId, req.user!.userId);
      res.json({ expense });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
