import { Router } from 'express';
import { runNewsSync } from '../cron/newsUpdate.js';
import { env } from '../config/env.js';
const cronRouter = Router();
cronRouter.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized: Invalid CRON_SECRET' });
    return;
  }
  try {
    const result = await runNewsSync();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync news' });
  }
});

export default cronRouter;