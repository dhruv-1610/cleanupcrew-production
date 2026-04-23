import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/** Extended Error with optional HTTP status code and operational flag. */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number | string;
  errors?: Record<string, { message: string }>;
  kind?: string;
  path?: string;
  value?: unknown;
}

/** Redact token-like strings from messages so they are never logged. */
function sanitizeForLog(msg: string): string {
  return msg
    .replace(/\bBearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/\bsk_[^\s]+/g, 'sk_[REDACTED]')
    .replace(/\bwhsec_[^\s]+/g, 'whsec_[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT]');
}

/**
 * Normalise known error types into { statusCode, message, isOperational }.
 * This prevents Mongoose/BSON/JSON errors from becoming 500 crashes.
 */
function normaliseError(err: AppError): { statusCode: number; message: string } {
  // Already operational (our own OperationalError subclasses)
  if (err.isOperational) {
    return { statusCode: err.statusCode ?? 400, message: err.message };
  }

  // Mongoose ValidationError (e.g. schema constraint failures)
  if (err.name === 'ValidationError' && err.errors) {
    const msgs = Object.values(err.errors).map((e) => e.message);
    return { statusCode: 400, message: msgs.join('; ') || 'Validation failed' };
  }

  // Mongoose CastError (e.g. invalid ObjectId in query)
  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${err.path || 'parameter'}: ${err.value}` };
  }

  // BSON errors (e.g. new ObjectId('bad'))
  if (err.name === 'BSONError' || err.message?.includes('input must be a 24 character hex string')) {
    return { statusCode: 400, message: 'Invalid ID format: must be a 24-character hex string' };
  }

  // MongoDB duplicate key
  if (err.code === 11000 || err.code === '11000') {
    return { statusCode: 409, message: 'Duplicate entry — this record already exists' };
  }

  // JSON parse error (malformed request body)
  if (err.name === 'SyntaxError' && err.message?.includes('JSON')) {
    return { statusCode: 400, message: 'Malformed JSON in request body' };
  }

  // PayloadTooLargeError (body size exceeded)
  if (err.name === 'PayloadTooLargeError' || (err as any).type === 'entity.too.large') {
    return { statusCode: 413, message: 'Request body too large' };
  }

  // Stripe errors
  if (err.name === 'StripeError' || (err as any).type?.startsWith?.('Stripe')) {
    return { statusCode: 502, message: 'Payment service error. Please try again.' };
  }

  // Default: unknown / programmer error → generic 500
  return { statusCode: 500, message: 'Internal Server Error' };
}

/**
 * Global Express error-handling middleware.
 *
 * - Catches ALL error types and converts them to safe HTTP responses.
 * - Production: no stack in response; logged message sanitized (no JWT/Stripe).
 * - Development: stack in response and in logs.
 * - Must be registered LAST in the middleware chain (4-arg signature).
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { statusCode, message } = normaliseError(err);
  const isProduction = process.env.NODE_ENV === 'production';

  const logPayload: Record<string, unknown> = {
    message: isProduction ? sanitizeForLog(err.message) : err.message,
    statusCode,
    errorName: err.name,
    ...(req.requestId && { requestId: req.requestId }),
  };
  if (!isProduction && err.stack) {
    logPayload.stack = err.stack;
  }

  // Log 5xx as error, 4xx as warn
  if (statusCode >= 500) {
    logger.error(logPayload);
  } else {
    logger.warn(logPayload);
  }

  // Never send response if headers already sent
  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(!isProduction && err.stack && { stack: err.stack }),
    },
  });
}
