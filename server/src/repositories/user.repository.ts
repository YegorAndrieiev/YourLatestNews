import { prisma } from '../config/prisma';
export const searchUsers = async (query: string) => {
  return prisma.user.findMany({
    where: {
      username: {
        startsWith: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
    },
    take: 5,
  });
};
