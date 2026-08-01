import { Router } from 'express';
import {
  getTasksController,
  createTaskController,
  deleteTaskController,
  updateTaskStatusController,
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = Router();
router.get('', authMiddleware, getTasksController);
router.post('', authMiddleware, createTaskController);
router.delete('/:id', authMiddleware, deleteTaskController);
router.patch('/:id', authMiddleware, updateTaskStatusController);
export default router;
