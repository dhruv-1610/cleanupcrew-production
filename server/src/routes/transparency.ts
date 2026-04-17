import { Router, Request, Response, NextFunction } from 'express';
import * as transparencyService from '../services/transparency.service';

const router = Router();

/** GET /api/transparency — Platform-wide transparency data (aggregate stats). */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await transparencyService.getPlatformTransparency();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/** GET /api/transparency/:driveId — Public transparency data for a drive. */
router.get('/:driveId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driveId = Array.isArray(req.params.driveId)
      ? req.params.driveId[0]
      : req.params.driveId;

    const result = await transparencyService.getTransparency(driveId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

