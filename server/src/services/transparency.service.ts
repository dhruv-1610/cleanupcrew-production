import { Drive } from '../models/drive.model';
import { Donation } from '../models/donation.model';
import { Impact } from '../models/impact.model';
import { Expense } from '../models/expense.model';
import { Attendance } from '../models/attendance.model';
import { User } from '../models/user.model';
import { NotFoundError } from '../utils/errors';
import { toObjectId, isValidObjectId } from '../middleware/validateObjectId';

// ── Platform-wide transparency ──────────────────────────────────────────────

/**
 * Aggregate platform-wide transparency data for the public Transparency page.
 * Returns real data from the database — no mock fallbacks.
 */
export async function getPlatformTransparency() {
  const [
    drives,
    completedDonations,
    verifiedExpenses,
    impacts,
    totalUsers,
  ] = await Promise.all([
    Drive.find({}).lean(),
    Donation.find({ status: 'completed' }).lean(),
    Expense.find({ isVerified: true }).lean(),
    Impact.find({}).lean(),
    User.countDocuments(),
  ]);

  const completedDrives = drives.filter((d) => d.status === 'completed');
  const totalFundsRaised = completedDonations.reduce((s, d) => s + d.amount, 0);
  const totalExpenses = verifiedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalWasteKg = impacts.reduce((s, i) => s + (i.wasteCollected ?? 0), 0);
  const totalAreaCleaned = impacts.reduce((s, i) => s + (i.areaCleaned ?? 0), 0);
  const totalWorkHours = impacts.reduce((s, i) => s + (i.workHours ?? 0), 0);
  const totalVolunteers = totalUsers;

  // Compute unique cities from drive locations
  const cities = new Set<string>();
  for (const d of drives) {
    const loc = d.location;
    if (loc && typeof loc === 'object' && 'coordinates' in loc) {
      // Use rough coordinate binning for city counting
      const key = `${(loc as any).coordinates?.[1]?.toFixed(1)},${(loc as any).coordinates?.[0]?.toFixed(1)}`;
      if (key !== 'undefined,undefined') cities.add(key);
    }
  }

  return {
    stats: {
      totalDrives: drives.length,
      completedDrives: completedDrives.length,
      totalVolunteers,
      totalFundsRaised,
      totalExpenses,
      totalWasteKg,
      totalAreaCleaned,
      totalWorkHours,
      citiesCovered: cities.size || drives.length,
    },
    donations: completedDonations.map((d) => ({
      id: d._id.toString(),
      driveId: d.driveId.toString(),
      userId: d.userId.toString(),
      amount: d.amount,
      date: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      status: d.status,
    })),
    expenses: verifiedExpenses.map((e) => ({
      id: e._id.toString(),
      driveId: e.driveId.toString(),
      category: e.category,
      amount: e.amount,
      description: '',
      proofUrl: e.proofUrl,
      isVerified: e.isVerified,
      date: e.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    drives: drives.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      status: d.status,
      date: d.date,
      maxVolunteers: d.maxVolunteers,
      currentVolunteers: (d.requiredRoles || []).reduce((s: number, r: any) => s + (r.booked ?? 0), 0),
      fundingGoal: d.fundingGoal ?? 0,
      fundingRaised: d.fundingRaised ?? 0,
    })),
  };
}

// ── Drive-specific transparency ─────────────────────────────────────────────

/**
 * Get transparency data for a specific drive (public).
 * Returns drive info, donations, expenses, and impact.
 * Gracefully handles missing data instead of throwing 404.
 */
export async function getTransparency(driveId: string) {
  if (!isValidObjectId(driveId)) {
    throw new NotFoundError('Drive not found');
  }

  const driveObjectId = toObjectId(driveId, 'driveId');

  const [drive, donations, expenses, impact, attendances] = await Promise.all([
    Drive.findById(driveObjectId).lean(),
    Donation.find({ driveId: driveObjectId, status: 'completed' }).sort({ createdAt: -1 }).lean(),
    Expense.find({ driveId: driveObjectId }).sort({ createdAt: -1 }).lean(),
    Impact.findOne({ driveId: driveObjectId }).lean(),
    Attendance.find({ driveId: driveObjectId, status: { $in: ['booked', 'checked_in'] } })
      .select('role status')
      .lean(),
  ]);

  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const volunteerCount = attendances.length;
  const checkedInCount = attendances.filter((a) => a.status === 'checked_in').length;

  return {
    drive: {
      id: drive._id.toString(),
      title: drive.title,
      status: drive.status,
      date: drive.date,
      maxVolunteers: drive.maxVolunteers,
      currentVolunteers: (drive.requiredRoles || []).reduce((s: number, r: any) => s + (r.booked ?? 0), 0),
      fundingGoal: drive.fundingGoal ?? 0,
      fundingRaised: drive.fundingRaised ?? 0,
      requiredRoles: drive.requiredRoles,
    },
    funding: {
      fundingGoal: drive.fundingGoal ?? 0,
      fundingRaised: drive.fundingRaised ?? 0,
      totalDonations,
      totalExpenses,
      balance: totalDonations - totalExpenses,
      donationCount: donations.length,
    },
    donations: donations.map((d) => ({
      id: d._id.toString(),
      userId: d.userId.toString(),
      amount: d.amount,
      date: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      status: d.status,
    })),
    expenses: expenses.map((e) => ({
      id: e._id.toString(),
      category: e.category,
      amount: e.amount,
      proofUrl: e.proofUrl,
      isVerified: e.isVerified,
      date: e.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    impact: impact
      ? {
          wasteCollected: impact.wasteCollected,
          areaCleaned: impact.areaCleaned,
          workHours: impact.workHours,
          beforePhotos: impact.beforePhotos ?? [],
          afterPhotos: impact.afterPhotos ?? [],
        }
      : null,
    attendance: {
      totalBooked: volunteerCount,
      checkedIn: checkedInCount,
    },
  };
}
