import { prisma } from '../config/prisma';
export const resolvers = {
  Query: {
    userById: async (_: any, { id }: { id: string }) => {
      return await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true },
      });
    },
  },
};
