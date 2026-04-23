import { Drive } from '../models/drive.model';
import { Impact, IImpact } from '../models/impact.model';
import { Report } from '../models/report.model';
import { Attendance } from '../models/attendance.model';
import { User } from '../models/user.model';
import { ActivityLog } from '../models/activityLog.model';
import { NotFoundError } from '../utils/errors';
import { toObjectId } from '../middleware/validateObjectId';

// ── Submit impact ───────────────────────────────────────────────────────────

export interface SubmitImpactInput {
  driveId: string;
  wasteCollected: number;
  areaCleaned: number;
  workHours: number;
  beforePhotoUrls: string[];
  afterPhotoUrls: string[];
  submittedBy: string;
}

/**
 * Submit impact for a drive (admin only).
 * - Drive must exist and not already completed
 * - Creates Impact record
 * - Updates drive.status → completed, report.status → cleaned
 * - Creates ActivityLog
 */
export async function submitImpact(input: SubmitImpactInput): Promise<IImpact> {
  const driveObjectId = toObjectId(input.driveId, 'driveId');

  const drive = await Drive.findById(driveObjectId);
  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  let impact = await Impact.findOne({ driveId: driveObjectId });

  if (impact) {
    const hoursDiff = input.workHours - impact.workHours;
    impact.wasteCollected = input.wasteCollected;
    impact.areaCleaned = input.areaCleaned;
    impact.workHours = input.workHours;
    if (input.beforePhotoUrls.length > 0) impact.beforePhotos.push(...input.beforePhotoUrls);
    if (input.afterPhotoUrls.length > 0) impact.afterPhotos.push(...input.afterPhotoUrls);
    impact.submittedBy = input.submittedBy as any;
    impact.submittedAt = new Date();
    await impact.save();

    if (hoursDiff !== 0) {
      const checkedInAttendances = await Attendance.find({
        driveId: driveObjectId,
        status: 'checked_in',
      }).select('userId');
      for (const att of checkedInAttendances) {
        await User.updateOne(
          { _id: att.userId },
          { $inc: { 'stats.volunteerHours': hoursDiff } },
        );
      }
    }
  } else {
    impact = await Impact.create({
      driveId: driveObjectId,
      wasteCollected: input.wasteCollected,
      areaCleaned: input.areaCleaned,
      workHours: input.workHours,
      beforePhotos: input.beforePhotoUrls,
      afterPhotos: input.afterPhotoUrls,
      submittedBy: input.submittedBy,
      submittedAt: new Date(),
    });

    drive.status = 'completed';
    await drive.save();

    const report = await Report.findById(drive.reportId);
    if (report) {
      report.status = 'cleaned';
      await report.save();
    }

    await ActivityLog.create({
      entityType: 'Impact',
      entityId: impact._id,
      action: 'impact_submitted',
      performedBy: input.submittedBy,
    });

    const checkedInAttendances = await Attendance.find({
      driveId: driveObjectId,
      status: 'checked_in',
    }).select('userId');
    for (const att of checkedInAttendances) {
      await User.updateOne(
        { _id: att.userId },
        { $inc: { 'stats.volunteerHours': input.workHours } },
      );
    }
  }

  return impact;
}
