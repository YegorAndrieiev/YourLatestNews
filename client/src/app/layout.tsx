import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { GoogleButton } from '@/components/GoogleButton';
import { AuthProvider } from '@/context/AuthContext';
const geistSans = Geist({
  variable: '--font-font-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YourLatestNews — Розумний агрегатор новин',
  description: 'Найсвіжіші новини політики, спорту та науки.',
  keywords: ['новини', 'агрегатор', 'AI', 'спорт', 'політика', 'наука'],
  authors: [{ name: 'YourLatestNews Team' }],
  openGraph: {
    title: 'YourLatestNews — Розумний агрегатор новин',
    description: 'Персоналізована стрічка новин без спаму та дублікатів.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <AuthProvider>
          <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent hover:opacity-90 transition"
              >
                YourLatest
                <span className="text-emerald-600 dark:text-emerald-500">
                  News
                </span>
              </Link>
              <div className="flex items-center gap-4 shrink-0">
                <GoogleButton />
              </div>
            </div>
          </header>
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
            © 2026–{new Date().getFullYear()} YourLatestNews. News Aggregator.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
