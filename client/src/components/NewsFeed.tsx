"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { BookmarkButton } from "./BookmarkButton";

type News = {
  id: string;
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  publishedAt: number | string;
  imageUrl: string;
  saved: boolean;
};
interface NewsFeedProps {
  initialNews: News[];
  selectedCategories: string[];
}
const PAGE_LIMIT = 15;

export function NewsFeed({ initialNews, selectedCategories }: NewsFeedProps) {
  const [news, setNews] = useState<News[]>(initialNews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialNews.length >= PAGE_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setNews(initialNews);
    setPage(1);
    setHasMore(initialNews.length >= PAGE_LIMIT);
    setIsError(false);
  }, [initialNews]);
  const loadMoreNews = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setIsError(false);
    const nextPage = page + 1;
    try {
      const categoriesParam = selectedCategories.join(",");
      const res = await fetch(
        `/api/news?page=${nextPage}&limit=${PAGE_LIMIT}&categories=${categoriesParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch news");
      const newNews: News[] = await res.json();
      if (newNews.length < PAGE_LIMIT) {
        setHasMore(false);
      }
      if (newNews.length > 0) {
        setNews((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewNews = newNews.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewNews];
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more news:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, selectedCategories]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isError) {
          loadMoreNews();
        }
      },
      { threshold: 0.1 }
    );
    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loadMoreNews, hasMore, isLoading, isError]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {news.map((item) => (
          <article
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
              <span className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                {item.category}
              </span>
              <div className="absolute top-3 right-3">
                <BookmarkButton newsId={item.id} initialSaved={item.saved} />
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span>{item.sourceName}</span>
                  <span>{item.publishedAt}</span>
                </div>

                <h3 className="font-bold text-lg leading-snug text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
      <div ref={observerRef} className="py-6 flex justify-center items-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isError && (
          <button
            onClick={loadMoreNews}
            className="text-xs text-rose-500 hover:underline font-medium"
          >
            Помилка завантаження. Натисніть, щоб спробувати знову.
          </button>
        )}
        {!hasMore && news.length > 0 && !isError && (
          <p className="text-xs text-zinc-400">Ви переглянули всі новини</p>
        )}
      </div>
    </div>
  );
}