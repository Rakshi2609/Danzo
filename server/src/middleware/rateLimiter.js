import rateLimit from 'express-rate-limit';

// Standard rate limit response helper
const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    statusCode: 429,
    message: {
      error: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
    },
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    }
  });
};

// 1. General API rate limiter (300 requests per 15 minutes)
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many API requests from this IP address. Please slow down and try again after 15 minutes.'
});

// 2. Strict Auth limiter for login/token exchange (30 attempts per 15 minutes)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// 3. Task Creation & Mutation limiter (100 creation actions per 15 minutes)
export const mutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many task creation or update requests. Please wait a moment.'
});

// 4. Batch & Trigger rate limiter (15 runs per 15 minutes)
export const triggerLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Task generation rate limit reached. Please wait before triggering batch runs again.'
});
