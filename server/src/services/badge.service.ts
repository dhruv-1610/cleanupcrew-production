import { User } from '../models/user.model';
import { NotFoundError } from '../utils/errors';

export const VOLUNTEER_BADGE_TIERS = [
  { name: 'Bronze', minDrives: 1 },
  { name: 'Silver', minDrives: 5 },
  { name: 'Gold', minDrives: 15 },
  { name: 'Platinum', minDrives: 30 },
] as const;

/** Donor amounts in paise (₹1000 = 100000 paise). */
export const DONOR_BADGE_TIERS = [
  { name: 'Bronze', minAmount: 100_000 },
  { name: 'Silver', minAmount: 500_000 },
  { name: 'Gold', minAmount: 2_000_000 },
  { name: 'Platinum', minAmount: 5_000_000 },
] as const;

/**
 * Calculate volunteer badge from drive count (checked_in attendance).
 * Pass driveCount from aggregation or stats.
 */
export function getVolunteerBadge(driveCount: number): string {
  let badge = 'None';
  for (const tier of VOLUNTEER_BADGE_TIERS) {
    if (driveCount >= tier.minDrives) badge = tier.name;
  }
  return badge;
}

/**
 * Calculate donor badge from total donations (paise).
 */
export function getDonorBadge(totalAmountPaise: number): string {
  let badge = 'None';
  for (const tier of DONOR_BADGE_TIERS) {
    if (totalAmountPaise >= tier.minAmount) badge = tier.name;
  }
  return badge;
}

/**
 * Get badges for a user from their stats.
 * stats.donations = total amount in paise
 * stats.volunteerHours doesn't give drive count - we need to count checked_in attendance.
 */
export async function getUserBadges(userId: string): Promise<{
  volunteerBadge: string;
  donorBadge: string;
  driveCount: number;
  totalDonations: number;
}> {
  const mongoose = await import('mongoose');
  const Attendance = (await import('../models/attendance.model')).Attendance;
  const { Drive } = await import('../models/drive.model');

  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  // Count drives where user has booked/checked-in AND drive is completed
  // This ensures users who participated get badges even without QR check-in
  const userAttendances = await Attendance.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: ['booked', 'checked_in'] },
  }).lean();

  // Get all drive IDs the user attended
  const attendedDriveIds = userAttendances.map(a => a.driveId);

  // Count how many of those drives are completed (i.e., actually happened)
  let driveCount = 0;
  if (attendedDriveIds.length > 0) {
    driveCount = await Drive.countDocuments({
      _id: { $in: attendedDriveIds },
      status: 'completed',
    });
  }

  // Also count checked_in as a fallback (even if drive isn't completed yet,
  // QR check-in proves physical presence)
  const checkedInCount = userAttendances.filter(a => a.status === 'checked_in').length;
  
  // Use the higher count
  driveCount = Math.max(driveCount, checkedInCount);

  const totalDonations = user.stats?.donations ?? 0;

  return {
    volunteerBadge: getVolunteerBadge(driveCount),
    donorBadge: getDonorBadge(totalDonations),
    driveCount,
    totalDonations,
  };
}
