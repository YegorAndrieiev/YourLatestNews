import { getNewsRepo, bookMarkRepo } from '../repositories/news.repository.js';
export const getNews = async (
  page: number,
  limit: number,
  categoriesStr: string,
  userId?: string,
) => {
  if (categoriesStr === 'SAVED' && !userId) {
    return [];
  }
  const categoriesList =
    categoriesStr && categoriesStr !== 'ALL' && categoriesStr !== 'SAVED'
      ? categoriesStr.split(',').map((c) => c.trim())
      : [];
  return await getNewsRepo(page, limit, categoriesStr, categoriesList, userId);
};
export const bookMark = async (
  userId: string,
  newsId: string,
  saved: boolean,
) => {
  if (!newsId) throw new Error('Потрібне News ID');
  return await bookMarkRepo(userId, newsId, saved);
};
