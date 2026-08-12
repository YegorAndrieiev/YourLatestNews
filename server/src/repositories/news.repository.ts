import { prisma } from '../config/prisma.js';
import { News } from '../generated/prisma/client.js';
type NewsWithOptionalSavedBy = News & {
  savedBy?: { userId: string }[];
};
export const getNewsRepo = async (
  page: number,
  limit: number,
  categoriesType: string,
  categoriesList: string[],
  userId?: string,
) => {
  const skip = (page - 1) * limit;
  if (categoriesType === 'SAVED' && userId) {
    const savedRecords = await prisma.savedNews.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { savedAt: 'desc' },
      include: { news: true },
    });
    return savedRecords.map((record: { news: News }) => ({
      ...record.news,
      saved: true,
    }));
  }
  const whereClause =
    categoriesList.length > 0 ? { category: { in: categoriesList } } : {};
  const newsList = await prisma.news.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: { publishedAt: 'desc' },
    include: userId
      ? {
          savedBy: {
            where: { userId },
            select: { userId: true },
          },
        }
      : undefined,
  });
  return newsList.map((item: NewsWithOptionalSavedBy) => {
    const { savedBy, ...newsData } = item;
    return {
      ...newsData,
      saved: savedBy ? savedBy.length > 0 : false,
    };
  });
};
export const bookMarkRepo = async (
  userId: string,
  newsId: string,
  saved: boolean,
) => {
  if (saved) {
    return await prisma.savedNews.upsert({
      where: {
        userId_newsId: { userId, newsId },
      },
      create: { userId, newsId },
      update: {},
    });
  } else {
    return await prisma.savedNews.deleteMany({
      where: { userId, newsId },
    });
  }
};
