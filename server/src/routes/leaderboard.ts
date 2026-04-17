import { Router, Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboard.service';
import { leaderboardPeriodSchema } from '../validation/leaderboard.validation';

const router = Router();

function parsePeriod(req: Request): 'all-time' | 'monthly' {
  const parsed = leaderboardPeriodSchema.safeParse(req.query);
  if (!parsed.success) return 'all-time';
  return parsed.data.period;
}

/** GET /api/leaderboard — Combined leaderboard (both volunteers + donors). */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const [rawVolunteers, rawDonors] = await Promise.all([
      leaderboardService.getVolunteerLeaderboard(period),
      leaderboardService.getDonorLeaderboard(period),
    ]);

    // Map to the shape the frontend expects
    const volunteers = rawVolunteers.map((v: Record<string, unknown>, idx: number) => {
      const user = v.user as { _id: { toString(): string }; profile?: { name?: string }; createdAt?: Date } | undefined;
      const driveCount = (v.driveCount as number) ?? 0;
      return {
        rank: idx + 1,
        name: user?.profile?.name ?? 'Volunteer',
        drives: driveCount,
        hours: driveCount * 4,
        wasteKg: driveCount * 25,
        badges: Math.min(driveCount, 5),
        points: driveCount * 100,
      };
    });

    const donors = rawDonors.map((d: Record<string, unknown>, idx: number) => {
      const user = d.user as { _id: { toString(): string }; profile?: { name?: string }; createdAt?: Date } | undefined;
      const totalAmount = (d.totalAmount as number) ?? 0;
      return {
        rank: idx + 1,
        name: user?.profile?.name ?? 'Donor',
        amount: totalAmount,
        drives: Math.max(1, Math.floor(totalAmount / 100000)),
        badges: Math.min(Math.floor(totalAmount / 200000), 5),
      };
    });

    res.json({ leaderboard: { volunteers, donors } });
  } catch (error) {
    next(error);
  }
});

/** GET /api/leaderboard/donors */
router.get('/donors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const donors = await leaderboardService.getDonorLeaderboard(period);
    res.json({ donors });
  } catch (error) {
    next(error);
  }
});

/** GET /api/leaderboard/volunteers */
router.get('/volunteers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const volunteers = await leaderboardService.getVolunteerLeaderboard(period);
    res.json({ volunteers });
  } catch (error) {
    next(error);
  }
});

export default router;

