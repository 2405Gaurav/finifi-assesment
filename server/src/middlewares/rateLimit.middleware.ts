import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const store = new Map<string, RateLimitEntry>();

const getClientKey = (req: Request) => `${req.ip || 'unknown'}:${req.baseUrl}${req.path}`;

export const createRateLimiter = (options: RateLimitOptions) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = getClientKey(req);
    const existing = store.get(key);

    if (!existing || existing.expiresAt <= now) {
      store.set(key, { count: 1, expiresAt: now + options.windowMs });
      return next();
    }

    if (existing.count >= options.maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
      return next(
        new ApiError(httpStatus.TOO_MANY_REQUESTS, options.message, true, '', {
          retryAfterSeconds,
          windowMs: options.windowMs,
          maxRequests: options.maxRequests,
        }),
      );
    }

    existing.count += 1;
    store.set(key, existing);
    return next();
  };
};

export const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 120,
  message: 'Too many API requests from this client. Please wait a bit before trying again.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'Too many upload attempts from this client. Please let the AI breathe for a moment and try again.',
});
