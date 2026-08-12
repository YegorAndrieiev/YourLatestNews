import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import redisClient from '../config/redisClient.js';
export const refreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (jwtErr) {
    throw new Error('Invalid refresh token', { cause: jwtErr });
  }
  const redisKey = `session:${token}`;
  const sessionData = await redisClient.get(redisKey);
  if (!sessionData) {
    throw new Error('Session not found or expired');
  }
  let session;
  try {
    session = JSON.parse(sessionData);
  } catch (parseErr) {
    throw new Error('Session data is corrupted', { cause: parseErr });
  }
  if (!session || !session.user || !session.expiresAt) {
    throw new Error('Session structure is invalid');
  }
  const serverTime = new Date();
  const sessionExpiresAt = new Date(session.expiresAt);
  const diffInMs = sessionExpiresAt.getTime() - serverTime.getTime();
  if (diffInMs < 0) {
    throw new Error('Session expired');
  }
  const newAccessToken = jwt.sign(
    {
      userId: session.user.id,
      role: session.user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  );
  return newAccessToken;
};
