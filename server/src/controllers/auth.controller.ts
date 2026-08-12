import type { Request, Response } from 'express';
import { refreshToken } from '../services/auth.service.js';
import { findUserById } from '../repositories/auth.repository.js';
import redisClient from '../config/redisClient.js';
export const getMeRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }
    const newAccessToken = await refreshToken(token);
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const redisKey = `session:${token}`;
      await redisClient.del(redisKey);
    }
  } catch (error) {
    console.error('❌ Redis logout error:', error);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({ success: true });
};
