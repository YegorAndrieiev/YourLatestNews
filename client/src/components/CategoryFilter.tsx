'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button'; 

const categories = [
  { id: 'ALL', label: 'Всі новини' },
  { id: 'POLITICS', label: 'Політика' },
  { id: 'SPORT', label: 'Спорт' },
  { id: 'SCIENCE', label: 'Наука' },
  { id: 'SAVED', label: 'Збережені' },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const selectedCategories = categoryParam ? categoryParam.split(',') : [];
  const isSavedSelected = selectedCategories.includes('SAVED');
  const isAllSelected = selectedCategories.length === 0;
  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'SAVED') {
      if (isSavedSelected) {
        params.delete('category');
      } else {
        params.set('category', 'SAVED');
      }
    } else if (id === 'ALL') {
      params.delete('category');
    } else {
      let updated: string[];
      if (isSavedSelected) {
        updated = [id];
      } else if (selectedCategories.includes(id)) {
        updated = selectedCategories.filter((cat) => cat !== id);
      } else {
        updated = [...selectedCategories, id];
      }
      const regularCategoryIds = categories
      .filter((c) => c.id !== 'ALL' && c.id !== 'SAVED')
      .map((c) => c.id);
      if (updated.length === 0 || updated.length === regularCategoryIds.length) {
        params.delete('category');
      } else {
        params.set('category', updated.join(','));
      }
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap pb-2 scrollbar-none">
      {categories.map((cat) => {
        let isActive = false;
        if (cat.id === 'ALL') {
          isActive = isAllSelected;
        } else if (cat.id === 'SAVED') {
          isActive = isSavedSelected;
        } else {
          isActive = !isSavedSelected && selectedCategories.includes(cat.id);
        }
        return (
          <Button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={
              isActive
                ? "bg-emerald-600 hover:bg-emerald-600 text-white border-transparent"
                : "text-zinc-600 dark:text-zinc-400"
            }
          >
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}