import { CategoryFilter } from '@/components/CategoryFilter';
import { NewsFeed } from '@/components/NewsFeed';
import { cookies } from 'next/headers';

const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

type News = {
  id: string;
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  publishedAt: number;
  imageUrl: string;
  saved: boolean;
};

async function fetchInitialNews(categories: string[]) {
  if (categories.includes('SAVED')) {
    return [];
  }
  try {
    const categoriesParam = categories.join(',');
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const res = await fetch(
      `${BASE_URL}/api/news?page=1&limit=15&categories=${categoriesParam}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Fetch initial news error:', error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const categoryParam = resolvedParams.category;
  const selectedCategories = categoryParam ? categoryParam.split(',') : [];
  const initialNews: News[] = await fetchInitialNews(selectedCategories);

  return (
    <div className="flex flex-col items-center space-y-8">
      <section className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight ">
          Головні події під контролем
        </h1>
      </section>

      <section>
        <CategoryFilter />
      </section>

      <NewsFeed
        initialNews={initialNews}
        selectedCategories={selectedCategories}
      />
    </div>
  );
}
