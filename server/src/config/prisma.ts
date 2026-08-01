import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env.js';
// 1. Створюємо пул з'єднань за допомогою стандартного драйвера PostgreSQL
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
