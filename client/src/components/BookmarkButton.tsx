'use client';
import { request } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
interface BookmarkButtonProps {
  newsId: string;
  initialSaved: boolean;
}
export function BookmarkButton({ newsId, initialSaved }: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [prevInitialSaved, setPrevInitialSaved] = useState(initialSaved);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const lastSyncedStateRef = useRef(initialSaved);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  if (initialSaved !== prevInitialSaved) {
    setPrevInitialSaved(initialSaved);
    setIsSaved(initialSaved);
  }
  useEffect(() => {
    lastSyncedStateRef.current = initialSaved;
  }, [initialSaved]);
  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 3000);
      return;
    }
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      if (nextSavedState === lastSyncedStateRef.current) return;
      try {
        await request(`/api/news/${newsId}/bookmark`, {
          method: 'POST',
          body: JSON.stringify({ saved: nextSavedState }),
        });
        lastSyncedStateRef.current = nextSavedState;
      } catch (error) {
        console.error('Bookmark sync failed:', error);
        setIsSaved(lastSyncedStateRef.current);
      }
    }, 600);
  };
  return (
    <div className="relative">
      {showAuthWarning && (
        <div className="absolute right-0 whitespace-nowrap bg-zinc-900/90 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200 z-20">
          Увійдіть в акаунт для збереження
        </div>
      )}
      {!showAuthWarning && (
        <button
          onClick={handleToggleSave}
          className={`p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center border ${
            isSaved
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
              : 'bg-zinc-900/40 border-white/10 text-emerald-400 hover:bg-zinc-900/60 hover:text-emerald-300'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-5 h-5 transition-all duration-300 ${
              isSaved
                ? 'fill-emerald-500 stroke-emerald-500 scale-105'
                : 'fill-transparent stroke-emerald-400 stroke-[2]'
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
