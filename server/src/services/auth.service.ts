import bcrypt from 'bcrypt';
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  createVerificationCode,
  findVerifyCodeByEmail,
  deleteVerifyCodeByEmail,
  updateUserPassword,
} from '../repositories/auth.repository.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import redisClient from '../config/redisClient.js';
const usernameRegex = /^[A-Za-z0-9_]{8,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import { transporter } from '../config/mailer.js';
type RegisterInput = {
  username: string;
  email: string;
  password: string;
  verificationCode: string;
};
type LoginInput = {
  input: string;
  password: string;
};
type ResetInput = {
  email: string;
  password: string;
  verificationCode: string;
};
const sendEmail = async (email: string, code: string) => {
  try {
    await transporter.sendMail({
      from: `"AI Teamboard" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${code}`,
    });
  } catch (error) {
    throw new Error('Failed to send verification email', { cause: error });
  }
};
export const sendCode = async (email: string, reset: boolean) => {
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  if (reset) {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
  }
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await createVerificationCode({
    email,
    code,
    expiresAt,
  });
  await sendEmail(email, code);
};
export const register = async (data: RegisterInput) => {
  const { username, email, password, verificationCode } = data;

  if (!username || !email || !password || !verificationCode) {
    throw new Error('All fields are required!');
  }

  if (!usernameRegex.test(username)) {
    throw new Error('Invalid username format');
  }

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  const record = await findVerifyCodeByEmail(email);
  if (
    !record ||
    record.code !== verificationCode ||
    record.expiresAt < new Date()
  ) {
    await deleteVerifyCodeByEmail(email);
    throw new Error('Invalid or expired code');
  }
  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    findUserByEmail(email),
    findUserByUsername(username),
  ]);
  if (existingEmailUser && existingUsernameUser) {
    throw new Error('Email and username already in use');
  } else if (existingEmailUser) {
    throw new Error('Email already in use');
  } else if (existingUsernameUser) {
    throw new Error('Username already in use');
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user, _] = await Promise.all([
    createUser({ username, email, password: hashedPassword }),
    deleteVerifyCodeByEmail(email),
  ]);
  return user;
};
export const login = async (data: LoginInput) => {
  const { input, password } = data;
  if (!input || !password) {
    throw new Error('All fields are required');
  }
  let user;
  if (input.includes('@')) {
    user = await findUserByEmail(input);
  } else {
    user = await findUserByUsername(input);
  }
  if (!user) {
    throw new Error('Account not found');
  }
  if (!user.password) {
    throw new Error('Please sign in using Google');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
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
  return { accessToken, refreshToken };
};
export const reset = async (data: ResetInput) => {
  const { email, password, verificationCode } = data;

  if (!email || !password || !verificationCode) {
    throw new Error('All fields are required');
  }

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const record = await findVerifyCodeByEmail(email);

  if (
    !record ||
    record.code !== verificationCode ||
    record.expiresAt < new Date()
  ) {
    await deleteVerifyCodeByEmail(email);
    throw new Error('Invalid or expired code');
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Promise.all([
    updateUserPassword(email, hashedPassword),
    deleteVerifyCodeByEmail(email),
  ]);
};
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
