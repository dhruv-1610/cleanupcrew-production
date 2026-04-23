import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Global rate limiter. Uses fixed window; stricter limits apply to
 * /auth, /api/drives/:id/donate, and POST /api/reports via route-level limiters.
 * GET endpoints that are polled by the frontend are skipped to prevent 429 errors
 * during normal usage (e.g. real-time volunteer updates).
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests. Please try again later.' } },
  skip: (req) => {
    if (req.method !== 'GET') return false;
    const path = req.path;
    return path.startsWith('/api/map') || 
           path.startsWith('/api/drives') || 
           path.startsWith('/api/reports') || 
           path.startsWith('/api/transparency') ||
           path.startsWith('/api/leaderboard');
  },
});
