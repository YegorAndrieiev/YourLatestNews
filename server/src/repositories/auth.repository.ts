import { prisma } from '../config/prisma.js';
export const createUser = async (data: { username: string; email: string }) => {
  return prisma.user.create({
    data,
  });
};
export const findUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: {
      email,
    },
  });
};
export const findUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      username: true,
    },
  });
};
