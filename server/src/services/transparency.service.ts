import mongoose from 'mongoose';
import { Drive } from '../models/drive.model';
import { Impact } from '../models/impact.model';
import { Expense } from '../models/expense.model';
import { Donation } from '../models/donation.model';
import { Attendance } from '../models/attendance.model';
import { NotFoundError } from '../utils/errors';

export interface TransparencyResult {
  driveId: string;
  moneyCollected: number;
  totalVerifiedExpenses: number;
  categoryBreakdown: Record<string, number>;
  photos: { before: string[]; after: string[] };
  attendanceCount: number;
}

/**
 * Get transparency data for a drive using aggregation pipeline.
 * - moneyCollected = drive.fundingRaised
 * - totalVerifiedExpenses = sum of isVerified=true expenses
 * - categoryBreakdown = verified expenses grouped by category
 * - photos = before + after from impact
 * - attendanceCount = count of attendance with status checked_in
 */
export async function getTransparency(driveId: string): Promise<TransparencyResult> {
  const driveObjectId = new mongoose.Types.ObjectId(driveId);

  const drive = await Drive.findById(driveObjectId);
  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  const impact = await Impact.findOne({ driveId: driveObjectId }).lean();
  if (!impact) {
    throw new NotFoundError('Impact not found for this drive');
  }

  const [expenseAgg, totalVerifiedResult, attendanceCount] = await Promise.all([
    Expense.aggregate<{ _id: string; total: number }>([
      { $match: { driveId: driveObjectId, isVerified: true } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate<{ total: number }>([
      { $match: { driveId: driveObjectId, isVerified: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Attendance.countDocuments({ driveId: driveObjectId, status: 'checked_in' }),
  ]);

  const categoryBreakdown: Record<string, number> = {};
  for (const row of expenseAgg) {
    categoryBreakdown[row._id] = row.total;
  }

  const totalVerifiedExpenses = totalVerifiedResult[0]?.total ?? 0;

  return {
    driveId: driveId.toString(),
    moneyCollected: drive.fundingRaised,
    totalVerifiedExpenses,
    categoryBreakdown,
    photos: {
      before: impact.beforePhotos ?? [],
      after: impact.afterPhotos ?? [],
    },
    attendanceCount,
  };
}

// ── Platform-wide transparency ──────────────────────────────────────────────

export interface PlatformTransparencyResult {
  stats: {
    totalDrives: number;
    completedDrives: number;
    totalVolunteers: number;
    totalWasteKg: number;
    totalFundsRaised: number;
  };
  donations: Array<{
    id: string;
    amount: number;
    driveId: string;
    date: string;
  }>;
  expenses: Array<{
    id: string;
    category: string;
    description: string;
    amount: number;
    driveId: string;
    date: string;
    receipt: boolean;
  }>;
  drives: Array<Record<string, unknown>>;
}

/**
 * Get platform-wide transparency data (aggregate stats).
 * Called by GET /api/transparency (no driveId param).
 * Returns the shape the frontend Transparency.jsx and Landing.jsx expect.
 */
export async function getPlatformTransparency(): Promise<PlatformTransparencyResult> {
  const [
    allDrives,
    totalVolunteers,
    impactAgg,
    fundingAgg,
    recentDonations,
    allExpenses,
  ] = await Promise.all([
    Drive.find().lean(),
    Attendance.countDocuments({ status: { $in: ['booked', 'checked_in'] } }),
    Impact.aggregate<{ totalWaste: number }>([
      { $group: { _id: null, totalWaste: { $sum: '$wasteCollected' } } },
    ]),
    Donation.aggregate<{ totalFunds: number }>([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalFunds: { $sum: '$amount' } } },
    ]),
    Donation.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Expense.find().sort({ createdAt: -1 }).lean(),
  ]);

  const completedDrives = allDrives.filter((d) => d.status === 'completed').length;
  const totalWasteKg = impactAgg[0]?.totalWaste ?? 0;
  const totalFundsRaised = fundingAgg[0]?.totalFunds ?? 0;

  const stats = {
    totalDrives: allDrives.length,
    completedDrives,
    totalVolunteers,
    totalWasteKg,
    totalFundsRaised,
  };

  const donations = recentDonations.map((d) => ({
    id: d._id.toString(),
    amount: d.amount,
    driveId: d.driveId.toString(),
    date: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  const expenses = allExpenses.map((e) => ({
    id: e._id.toString(),
    category: e.category.charAt(0).toUpperCase() + e.category.slice(1),
    description: `${e.category} expense`,
    amount: e.amount,
    driveId: e.driveId.toString(),
    date: e.createdAt?.toISOString?.() ?? new Date().toISOString(),
    receipt: e.isVerified,
  }));

  // Map drives to the shape the frontend expects
  const drives = allDrives.map((d) => {
    const totalBooked = d.requiredRoles?.reduce(
      (sum: number, r: { booked?: number }) => sum + (r.booked ?? 0),
      0,
    ) ?? 0;
    const totalCapacity = d.requiredRoles?.reduce(
      (sum: number, r: { capacity: number }) => sum + r.capacity,
      0,
    ) ?? 0;

    return {
      id: d._id.toString(),
      title: d.title,
      date: d.date,
      status: d.status === 'planned' ? 'upcoming' : d.status,
      location: d.location
        ? {
            address: `${d.location.coordinates[1].toFixed(4)}, ${d.location.coordinates[0].toFixed(4)}`,
            lat: d.location.coordinates[1],
            lng: d.location.coordinates[0],
          }
        : { address: 'Unknown' },
      currentVolunteers: totalBooked,
      maxVolunteers: totalCapacity,
      currentFunding: d.fundingRaised ?? 0,
      fundingGoal: d.fundingGoal ?? 0,
    };
  });

  return { stats, donations, expenses, drives };
}
