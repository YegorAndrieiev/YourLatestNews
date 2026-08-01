import type { Request, Response } from 'express';
import {
  sendCode,
  register,
  login,
  reset,
  refreshToken,
} from '../services/auth.service.js';
import { findUserById } from '../repositories/auth.repository.js';
import redisClient from '../config/redisClient.js';
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email, reset } = req.body;
    await sendCode(email, reset);
    return res.status(200).json({
      message: 'Verification code sent',
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, verificationCode } = req.body;

    const user = await register({
      username,
      email,
      password,
      verificationCode,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { input, password } = req.body;
    const { accessToken, refreshToken } = await login({ input, password });
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

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, verificationCode } = req.body;
    await reset({
      email,
      password,
      verificationCode,
    });
    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
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
