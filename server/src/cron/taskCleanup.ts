import cron from 'node-cron';
import { prisma } from '../config/prisma';
export const initCleanupCron = () => {
  cron.schedule('0 0 * * *', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.task.deleteMany({
      where: {
        status: 'done',
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    console.log('All old tasks deleted');
  });
};
