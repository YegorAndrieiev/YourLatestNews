import dotenv from 'dotenv';
dotenv.config();
export const env = {
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: process.env.REDIS_PORT || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  NEWSDATA_API_KEY: process.env.NEWSDATA_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || '',
  CRON_SECRET: process.env.CRON_SECRET || '',
};
