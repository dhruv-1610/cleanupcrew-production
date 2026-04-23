import { Router, Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboard.service';
import { leaderboardPeriodSchema } from '../validation/leaderboard.validation';

const router = Router();

function parsePeriod(req: Request): 'all-time' | 'monthly' {
  const parsed = leaderboardPeriodSchema.safeParse(req.query);
  if (!parsed.success) return 'all-time';
  return parsed.data.period;
}

const mapVolunteers = (rawVolunteers: any[]) =>
  rawVolunteers.map((v, idx) => {
    const user = v.user;
    const driveCount = v.driveCount ?? 0;
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

const mapDonors = (rawDonors: any[]) =>
  rawDonors.map((d, idx) => {
    const user = d.user;
    const totalAmount = d.totalAmount ?? 0;
    const driveCount = d.driveCount ?? 1;
    return {
      rank: idx + 1,
      name: user?.profile?.name ?? 'Donor',
      amount: totalAmount,
      drives: driveCount,
      badges: Math.min(Math.floor(totalAmount / 200000) + driveCount, 5),
    };
  });

/** GET /api/leaderboard — Combined leaderboard (both volunteers + donors). */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const [rawVolunteers, rawDonors] = await Promise.all([
      leaderboardService.getVolunteerLeaderboard(period),
      leaderboardService.getDonorLeaderboard(period),
    ]);

    res.json({
      leaderboard: {
        volunteers: mapVolunteers(rawVolunteers),
        donors: mapDonors(rawDonors),
      },
    });
  } catch (error) {
    next(error);
  }
});

/** GET /api/leaderboard/donors */
router.get('/donors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const rawDonors = await leaderboardService.getDonorLeaderboard(period);
    res.json({ donors: mapDonors(rawDonors) });
  } catch (error) {
    next(error);
  }
});

/** GET /api/leaderboard/volunteers */
router.get('/volunteers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req);
    const rawVolunteers = await leaderboardService.getVolunteerLeaderboard(period);
    res.json({ volunteers: mapVolunteers(rawVolunteers) });
  } catch (error) {
    next(error);
  }
});

export default router;

