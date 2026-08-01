import { prisma } from '../config/prisma.js';
import { TaskStatus } from '../generated/prisma/client.js';
export const findTasksByUser = (userId: string) => {
  return prisma.task.findMany({
    where: {
      OR: [{ userId }, { assignedToUserId: userId }],
    },
    include: {
      assignedToUser: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
export const createTaskRepo = (data: {
  title: string;
  description: string | undefined;
  userId: string;
  assignedToUserId: string;
}) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      userId: data.userId,
      assignedToUserId: data.assignedToUserId,
    },
    include: {
      assignedToUser: {
        select: {
          username: true,
        },
      },
    },
  });
};
export const findTaskById = (id: string) => {
  return prisma.task.findUnique({ where: { id } });
};
export const deleteTaskRepo = (id: string) => {
  return prisma.task.delete({ where: { id } });
};
export const updateTaskStatusRepo = (id: string, status: TaskStatus) => {
  return prisma.task.update({
    where: { id },
    data: { status },
  });
};
export const findUserByUsername = (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};
