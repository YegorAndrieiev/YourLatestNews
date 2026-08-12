import { Request, Response } from 'express';
import { bookMark, getNews } from '../services/news.service.js';

export const getNewsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const categories = (req.query.categories as string) || '';
    const userId = (req as any).user?.userId;
    const news = await getNews(page, limit, categories, userId);
    res.status(200).json(news);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const bookMarkController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const newsId = Array.isArray(req.params.newsId)
      ? req.params.newsId[0]
      : req.params.newsId;
    const { saved } = req.body;
    await bookMark(userId, newsId, Boolean(saved));
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
