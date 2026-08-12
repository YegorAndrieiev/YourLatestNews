import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { GoogleGenAI } from '@google/genai';
interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  description?: string;
  content?: string;
  source_id: string;
  image_url?: string;
  pubDate: string;
}
const defaultImages: Record<string, string> = {
  POLITICS:
    'https://placehold.co/800x192/ffffff/000000?text=%D0%9F%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0',
  SPORTS:
    'https://placehold.co/800x192/ffffff/000000?text=%D0%A1%D0%BF%D0%BE%D1%80%D1%82',
  SCIENCE:
    'https://placehold.co/800x192/ffffff/000000?text=%D0%9D%D0%B0%D1%83%D0%BA%D0%B0',
};
const fetchRawNews = async () => {
  const apiKey = env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return [];
  }
  const limit = 5;
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en,uk&category=politics,sports,science&size=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (data.status !== 'success') {
      return [];
    }
    const results: NewsDataArticle[] = data.results || [];
    const mappedNews = results.map((item, index) => {
      const mapped = {
        title: item.title,
        url: item.link,
        content: item.description || item.content || item.title,
        sourceName: item.source_id || 'YourLatestNews',
        imageUrl: item.image_url || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      };
      return mapped;
    });
    return mappedNews;
  } catch (error) {
    return [];
  }
};
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const calculateTitleSimilarity = (title1: string, title2: string): number => {
  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^\w\sа-яіїєґ]/gi, '');
  const words1 = new Set(sanitize(title1).split(/\s+/).filter(Boolean));
  const words2 = new Set(sanitize(title2).split(/\s+/).filter(Boolean));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  return (100 / Math.max(words1.size, words2.size)) * intersection.size;
};
export const runNewsSync = async () => {
  try {
    const rawNewsList = await fetchRawNews();
    if (!rawNewsList.length) {
      return { message: 'Немає нових статей з API', added: 0 };
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentNewsDb = await prisma.news.findMany({
      where: { createdAt: { gte: yesterday } },
      select: { title: true, url: true },
    });
    const existingUrlsSet = new Set(recentNewsDb.map((n) => n.url));
    let addedCount = 0;
    for (const article of rawNewsList) {
      if (existingUrlsSet.has(article.url)) {
        continue;
      }
      const prompt = `
          Ти — професійний український редактор та журналіст. 
          Проаналізуй заголовок та контент статті:
          Заголовок: ${JSON.stringify(article.title)}
          Контент: ${JSON.stringify(article.content)}

          Твоє завдання:
          1. Переклади заголовок українською мовою (ukrTitle).
          2. Склади детальний та інформативний summary (ukrSummary) на 2-4 речення українською мовою. Якщо оригінальний контент короткий або містить лише заголовок, використай свої знання, щоб надати повноцінний контекст.
          3. Вибери ОДНУ категорію зі списку: "POLITICS", "SPORTS", "SCIENCE". Якщо жодна не підходить, поверни null.
        `;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                ukrTitle: { type: 'string' },
                ukrSummary: { type: 'string' },
                category: {
                  type: 'string',
                  enum: ['POLITICS', 'SPORTS', 'SCIENCE'],
                  nullable: true,
                },
              },
              required: ['ukrTitle', 'ukrSummary', 'category'],
            },
          },
        });
        if (!response || !response.text) continue;
        const rawText = response.text;
        const cleanedJsonText = rawText.replace(/```json|```/g, '').trim();
        const aiResult = JSON.parse(cleanedJsonText);
        if (!aiResult || !aiResult.category || aiResult.category === 'null') {
          continue;
        }
        const translatedTitle = aiResult.ukrTitle;
        if (!translatedTitle) continue;
        let isDuplicate = false;
        for (const dbNews of recentNewsDb) {
          const similarity = calculateTitleSimilarity(
            translatedTitle,
            dbNews.title,
          );
          if (similarity >= 50) {
            isDuplicate = true;
            break;
          }
        }
        if (isDuplicate) continue;
        let finalImageUrl = article.imageUrl;
        if (!finalImageUrl) {
          finalImageUrl = defaultImages[aiResult.category] || '';
        }
        if (!finalImageUrl) continue;
        await prisma.news.create({
          data: {
            title: translatedTitle,
            url: article.url,
            summary: aiResult.ukrSummary,
            category: aiResult.category,
            sourceName: article.sourceName,
            imageUrl: finalImageUrl,
            publishedAt: new Date(article.publishedAt),
          },
        });
        recentNewsDb.push({ title: translatedTitle, url: article.url });
        addedCount++;
      } catch (aiError) {
        console.error('Помилка AI під час обробки статті:', aiError);
      }
    }
    return { 
      message: 'Синхронізація пройшла успішно', 
      added: addedCount 
    };
  } catch (error) {
    console.error('Помилка під час виконання крону збору новин:', error);
    throw error;
  }
};
