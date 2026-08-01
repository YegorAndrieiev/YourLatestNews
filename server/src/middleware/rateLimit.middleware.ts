import rateLimit from 'express-rate-limit';
export const min15Limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many accounts created from this IP',
  },
});
export const codeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  message: {
    error: 'Too many attempts',
  },
});
