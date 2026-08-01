import {
  findTasksByUser,
  createTaskRepo,
  deleteTaskRepo,
  findTaskById,
  updateTaskStatusRepo,
} from '../repositories/task.repository';
import { findUserByUsername } from '../repositories/auth.repository';
import { TaskStatus } from '../generated/prisma/client.js';
import redisClient from '../config/redisClient';
import { addEmailJob } from '../queues/email.queue';
const getTasksCacheKey = (userId: string) => `user:tasks:${userId}`;
const checkCacheKeys = async (
  userId: string,
  assignedToUserId: string | null,
) => {
  const userIdsToInvalidate = new Set<string>([userId]);
  if (assignedToUserId !== userId && assignedToUserId) {
    userIdsToInvalidate.add(assignedToUserId);
  }
  const cacheKeys = Array.from(userIdsToInvalidate).map((id) =>
    getTasksCacheKey(id),
  );
  await Promise.all(cacheKeys.map((key) => redisClient.del(key)));
};
export const getTasks = async (userId: string) => {
  const cacheKey = getTasksCacheKey(userId);
  try {
    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks) {
      console.log(`🎯 Cache HIT for user ${userId}`);
      return JSON.parse(cachedTasks);
    }
  } catch (err) {
    console.error('Redis GET error:', err);
  }
  const tasks = await findTasksByUser(userId);
  try {
    await redisClient.setEx(cacheKey, 180, JSON.stringify(tasks));
  } catch (err) {
    console.error('Redis SET error:', err);
  }

  return tasks;
};
export const createTask = async (
  userId: string,
  data: {
    title: string;
    description?: string;
    assignedTo?: string;
  },
) => {
  if (!data.title || !data.assignedTo) {
    throw new Error('Title and assignedTo required');
  }
  const assignedUser = await findUserByUsername(data.assignedTo);
  if (!assignedUser) {
    throw new Error('Assigned user not found');
  }
  const newTask = await createTaskRepo({
    title: data.title,
    description: data.description,
    userId,
    assignedToUserId: assignedUser.id,
  });
  addEmailJob(assignedUser.email, data.title).catch((err) => {
    console.log('Error adding email to queue', err);
  });
  await checkCacheKeys(userId, assignedUser.id);
  return newTask;
};
export const deleteTask = async (userId: string, taskId: string) => {
  const task = await findTaskById(taskId);

  if (!task) throw new Error('Task not found');

  if (task.userId !== userId) {
    throw new Error('Not allowed');
  }
  const deletedTask = await deleteTaskRepo(taskId);
  await checkCacheKeys(task.userId, task.assignedToUserId);
  return deletedTask;
};
export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  status: TaskStatus,
) => {
  const task = await findTaskById(taskId);

  if (!task) throw new Error('Task not found');

  if (task.assignedToUserId !== userId) {
    throw new Error('Not allowed');
  }
  const updatedTask = await updateTaskStatusRepo(taskId, status);
  await checkCacheKeys(task.userId, task.assignedToUserId);
  return updatedTask;
};
