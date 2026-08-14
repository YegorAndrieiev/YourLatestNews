import { Router } from 'express';
import {
  getMeRequest,
  refreshTokenController,
  logout,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import redisClient from '../config/redisClient.js';
const router = Router();
const url = env.CLIENT_URL || 'http://localhost:5173/';
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
    failureRedirect: url,
  }),
  async (req, res) => {
    console.log('[Callback Handler] 1. Зашли в callback роута');

    try {
      const user = req.user as any;
      console.log('[Callback Handler] 2. req.user получен:', user?.id);

      if (!user) {
        console.error('[Callback Handler Error] User отсутствует в req.user!');
        return res.redirect(url);
      }

      console.log('[Callback Handler] 3. Генерируем JWT токены...');
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

      console.log('[Callback Handler] 4. Сохраняем сессию в Redis:', redisKey);
      await redisClient.setEx(redisKey, 604800, JSON.stringify(sessionData));
      console.log('[Callback Handler] 5. Запись в Redis прошла успешно');

      console.log('[Callback Handler] 6. Устанавливаем куки в res.cookie...');
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      console.log('[Callback Handler] 7. Куки успешно добавлены в заголовки ответа');

      console.log('[Callback Handler] 8. Выполняем редирект на клиент:', url);
      return res.redirect(url);
    } catch (error) {
      console.error('[Callback Handler Error] Фатальная ошибка внутри callback:', error);
      return res.redirect(url);
    }
  },
);
export default router;
