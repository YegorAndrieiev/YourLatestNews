import { Request, Response } from 'express';
import {
  getTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
} from '../services/task.service';
type Params = {
  id: string;
};
//GET /tasks
export const getTasksController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
//POST /tasks
export const createTaskController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const task = await createTask(userId, req.body);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
//DELETE /tasks/id
export const deleteTaskController = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await deleteTask(userId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
//PATCH /tasks/id
export const updateTaskStatusController = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status } = req.body;
    await updateTaskStatus(userId, id, status);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
