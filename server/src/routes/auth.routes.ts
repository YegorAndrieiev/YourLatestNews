import { Router } from 'express';
import {
  registerUser,
  loginUser,
  sendVerificationCode,
  resetPassword,
  getMeRequest,
  refreshTokenController,
  logout,
} from '../controllers/auth.controller.js';
import {
  min15Limiter,
  codeLimiter,
} from '../middleware/rateLimit.middleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import redisClient from '../config/redisClient.js';
const router = Router();
router.post('/send-code', codeLimiter, sendVerificationCode);
router.post('/register', min15Limiter, registerUser);
router.post('/login', min15Limiter, loginUser);
router.post('/reset-password', min15Limiter, resetPassword);
router.get('/me', authMiddleware, getMeRequest);
router.post('/refresh', refreshTokenController);
router.post('/logout', logout);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login',
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '15m' },
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );
      const redisKey = `session:${refreshToken}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const sessionData = {
        user: {
          id: user.id,
          role: user.role,
        },
        expiresAt: expiresAt.toISOString(),
      };
      await redisClient.setEx(redisKey, 604800, JSON.stringify(sessionData));
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.redirect('http://localhost:5173/tasks');
    } catch {
      return res.redirect('http://localhost:5173/login');
    }
  },
);
export default router;
