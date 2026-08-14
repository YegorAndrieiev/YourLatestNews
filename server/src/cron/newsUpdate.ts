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
    console.log('[Cron Log] NEWSDATA_API_KEY відсутній у env');
    return [];
  }
  const limit = 5;
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en,uk&category=politics,sports,science&size=${limit}`;
  try {
    console.log('[Cron Log] Відправляємо запит до NewsData API...');
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[Cron Log] Помилка NewsData API HTTP status: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (data.status !== 'success') {
      console.log('[Cron Log] NewsData API повернув status !== "success":', data);
      return [];
    }
    const results: NewsDataArticle[] = data.results || [];
    console.log(`[Cron Log] NewsData API успішно повернув ${results.length} статей`);
    const mappedNews = results.map((item) => {
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
    console.error('[Cron Log Error] Помилка під час fetchRawNews:', error);
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
    console.log('[Cron Log] === Початок синхронізації новин ===');
    const rawNewsList = await fetchRawNews();
    if (!rawNewsList.length) {
      console.log('[Cron Log] Список rawNewsList порожній. Зупиняємо синхронізацію.');
      return { message: 'Немає нових статей з API', added: 0 };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentNewsDb = await prisma.news.findMany({
      where: { createdAt: { gte: yesterday } },
      select: { title: true, url: true },
    });

    console.log(`[Cron Log] Знайдено новин у БД за останні 24г: ${recentNewsDb.length}`);

    const existingUrlsSet = new Set(
      recentNewsDb.map((n: { title: string; url: string }) => n.url)
    );

    let addedCount = 0;

    for (const article of rawNewsList) {
      console.log(`\n[Cron Log] Обробка статті: "${article.title}" (${article.url})`);

      if (existingUrlsSet.has(article.url)) {
        console.log(`[Cron Skip] URL вже присутній у БД: ${article.url}`);
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
        console.log('[Cron Log] Надсилаємо запит до Gemini AI...');
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

        if (!response || !response.text) {
          console.log('[Cron Skip] Порожня відповідь від Gemini AI');
          continue;
        }

        const rawText = response.text;
        console.log('[Cron Log] AI сира відповідь:', rawText);

        const cleanedJsonText = rawText.replace(/```json|```/g, '').trim();
        const aiResult = JSON.parse(cleanedJsonText);

        console.log('[Cron Log] AI распарсений JSON:', aiResult);

        if (!aiResult || !aiResult.category || aiResult.category === 'null') {
          console.log(`[Cron Skip] Категорія відсутня або 'null': ${aiResult?.category}`);
          continue;
        }

        const translatedTitle = aiResult.ukrTitle;
        if (!translatedTitle) {
          console.log('[Cron Skip] Відсутній ukrTitle від AI');
          continue;
        }

        let isDuplicate = false;
        for (const dbNews of recentNewsDb) {
          const similarity = calculateTitleSimilarity(
            translatedTitle,
            dbNews.title,
          );
          if (similarity >= 50) {
            console.log(`[Cron Skip] Дублікат за заголовком (${similarity.toFixed(1)}%): "${translatedTitle}" ~ "${dbNews.title}"`);
            isDuplicate = true;
            break;
          }
        }

        if (isDuplicate) continue;

        let finalImageUrl = article.imageUrl;
        if (!finalImageUrl) {
          finalImageUrl = defaultImages[aiResult.category] || '';
          console.log(`[Cron Log] Оригінального imageUrl немає, беремо дефолтний: ${finalImageUrl}`);
        }

        if (!finalImageUrl) {
          console.log('[Cron Skip] Не вдалося визначити imageUrl');
          continue;
        }

        console.log('[Cron Log] Записуємо нову статтю в БД...');
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
        console.log(`[Cron Success] Успішно додано: "${translatedTitle}"`);
      } catch (aiError) {
        console.error('[Cron Error] Помилка AI під час обробки статті:', aiError);
      }
    }

    console.log(`[Cron Log] === Синхронізацію завершено. Додано: ${addedCount} ===`);

    return { 
      message: 'Синхронізація пройшла успішно', 
      added: addedCount 
    };
  } catch (error) {
    console.error('Помилка під час виконання крону збору новин:', error);
    throw error;
  }
};