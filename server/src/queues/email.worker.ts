import { Worker } from 'bullmq';
import { env } from '../config/env';
import { transporter } from '../config/mailer';
const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
};
export const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { email, title } = job.data;
    await transporter.sendMail({
      from: `"AI Teamboard" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'New task assigned!',
      text: `Hi there! You have been assigned a new task: "${title}".`,
    });
  },
  {
    connection,
  },
);
emailWorker.on('failed', (job, err) => {
  console.error(`💥 [WORKER] Error sending email for job ${job?.id}:`, err);
});
