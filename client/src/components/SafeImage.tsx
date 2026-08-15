import { useState } from 'react';
import Image from 'next/image';
interface SafeImageProps {
  src: string;
  category: string;
}
const defaultImages: Record<string, string> = {
  POLITICS: 'https://placehold.co/800x192/ffffff/000000?text=%D0%9F%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0',
  SPORTS: 'https://placehold.co/800x192/ffffff/000000?text=%D0%A1%D0%BF%D0%BE%D1%80%D1%82',
  SCIENCE: 'https://placehold.co/800x192/ffffff/000000?text=%D0%9D%D0%B0%D1%83%D0%BA%D0%B0',
};
export const SafeImage = ({ src, category }: SafeImageProps) => {
  const fallback = defaultImages[category] || '';
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'loaded');
  return (
    <div className="relative w-full h-full">
      {status === 'loading' && (
        <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      )}
      <Image
        src={imgSrc}
        alt=""
        fill
        className={`object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        unoptimized
        onLoad={() => {
          setStatus('loaded');
        }}
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
            setStatus('loaded');
          } else {
            setStatus('error');
          }
        }}
      />
    </div>
  );
};
