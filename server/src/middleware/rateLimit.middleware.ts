import rateLimit from 'express-rate-limit';
export const min15Limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    error: 'Too many accounts created from this IP',
  },
});
