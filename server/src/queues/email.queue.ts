import { Queue } from 'bullmq';
import { env } from '../config/env.js';
const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
};
export const emailQueue = new Queue('email-queue', { connection });
export const addEmailJob = async (email: string, title: string) => {
  await emailQueue.add(
    'send-task-notification',
    {
      email,
      title,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  );
};
