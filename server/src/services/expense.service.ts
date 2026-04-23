import { Drive } from '../models/drive.model';
import { Expense, IExpense, ExpenseCategory } from '../models/expense.model';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { toObjectId } from '../middleware/validateObjectId';

// ── Create expense ──────────────────────────────────────────────────────────

export interface CreateExpenseInput {
  driveId: string;
  category: ExpenseCategory;
  amount: number;
  proofUrl: string;
}

/**
 * Create expense for a drive (admin only).
 * Drive must exist. isVerified defaults to false.
 */
export async function createExpense(input: CreateExpenseInput): Promise<IExpense> {
  const driveObjectId = toObjectId(input.driveId, 'driveId');

  const drive = await Drive.findById(driveObjectId);
  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  const expense = await Expense.create({
    driveId: driveObjectId,
    category: input.category,
    amount: input.amount,
    proofUrl: input.proofUrl,
  });

  return expense;
}

// ── Verify expense ──────────────────────────────────────────────────────────

/**
 * Mark expense as verified (admin only).
 * Expense cannot be verified if already verified.
 */
export async function verifyExpense(expenseId: string, verifiedBy: string): Promise<IExpense> {
  const expenseObjectId = toObjectId(expenseId, 'expenseId');

  const expense = await Expense.findById(expenseObjectId);
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }

  if (expense.isVerified) {
    throw new BadRequestError('Expense is already verified');
  }

  expense.isVerified = true;
  expense.verifiedBy = toObjectId(verifiedBy, 'verifiedBy');
  expense.verifiedAt = new Date();
  await expense.save();

  return expense;
}
