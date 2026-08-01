import { CategoryFilter } from "@/components/CategoryFilter";
import { NewsFeed } from "@/components/NewsFeed";
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
}
async function fetchInitialNews(categories: string[]) {
  try {
    const categoriesParam = categories.join(",");
    const res = await fetch(
      `${BASE_URL}/api/news?page=1&limit=15&categories=${categoriesParam}`,
      { next: {revalidate: 60}}
    );
    return await res.json();
  } catch (error) {
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
  const initialNews:News[] = await fetchInitialNews(selectedCategories);
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Головні події під контролем
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-2xl">
          Автоматизований моніторинг перевірених джерел.
        </p>
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