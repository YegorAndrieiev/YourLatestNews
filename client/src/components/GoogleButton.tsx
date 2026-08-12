'use client';

import { useAuth } from '@/context/AuthContext';

export function GoogleButton() {
  const { user, logout, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };
  if (isLoading) {
    return (
      <div className="w-33 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
    );
  }
  if (user) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-semibold text-zinc-800 dark:text-zinc-200 max-w-[140px] sm:max-w-[200px] truncate">
          {user.username}
        </span>
        <button
          onClick={() => logout()}
          className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center shrink-0"
          aria-label="Вийти з акаунта"
          title="Вийти"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-5 h-5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9"
            />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <button
      className="flex items-center justify-center gap-2.5 sm:text-sm font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 p-2.5 sm:px-4 sm:py-2 rounded-xl transition shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
      aria-label="Увійти через Google"
      onClick={handleGoogleLogin}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5 shrink-0"
      >
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.48-1.12 2.74-2.38 3.58v2.97h3.84c2.24-2.06 3.67-5.1 3.67-8.4z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.97c-1.08.73-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.27v3.08C3.25 21.17 7.37 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.24 14.27a7.21 7.21 0 0 1 0-4.54V6.65H1.27a11.94 11.94 0 0 0 0 10.7l3.97-3.08z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.93 1.19 15.24 0 12 0 7.37 0 3.25 2.83 1.27 6.65l3.97 3.08c.95-2.88 3.61-5.01 6.76-5.01z"
        />
      </svg>
      <span>
        <span className="sm:hidden">Увійти</span>
        <span className="hidden sm:inline">Увійти через Google</span>
      </span>
    </button>
  );
}
