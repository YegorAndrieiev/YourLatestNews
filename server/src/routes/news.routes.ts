import { Router } from 'express';
import {
  getNewsController,
  bookMarkController,
} from '../controllers/news.controller.js';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../middleware/authMiddleware.js';
import { min15Limiter } from '../middleware/rateLimit.middleware.js';
const router = Router();
router.get('/', min15Limiter, optionalAuthMiddleware, getNewsController);
router.post(
  '/:newsId/bookmark',
  min15Limiter,
  authMiddleware,
  bookMarkController,
);
export default router;
