import { Router } from 'express';
import { searchUsersController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/search', authMiddleware, searchUsersController);
export default router;
