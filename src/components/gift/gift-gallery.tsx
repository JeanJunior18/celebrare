'use client';

import { useMemo, useState } from 'react';

import { GiftCard } from '@/components/gift/gift-card';
import { Button } from '@/components/ui/Button';
import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftStatus } from '@/domain/enums/gift-status';

export interface GiftGalleryProps {
  items: GiftItem[];
  eventId: string;
}

const PAGE_SIZE = 6;

type SortOption = 'AVAILABLE_FIRST' | 'NAME_ASC' | 'NAME_DESC' | 'CATEGORY';

const sortLabel: Record<SortOption, string> = {
  AVAILABLE_FIRST: 'Disponíveis primeiro',
  NAME_ASC: 'Nome (A-Z)',
  NAME_DESC: 'Nome (Z-A)',
  CATEGORY: 'Categoria',
};

function sortItems(items: GiftItem[], sortBy: SortOption): GiftItem[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'NAME_ASC':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    case 'NAME_DESC':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
    case 'CATEGORY':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'AVAILABLE_FIRST':
      return sorted.sort((a, b) => {
        const aAvailable = a.status === GiftStatus.AVAILABLE ? 0 : 1;
        const bAvailable = b.status === GiftStatus.AVAILABLE ? 0 : 1;
        return aAvailable - bAvailable;
      });
  }
}

export function GiftGallery({ items, eventId }: GiftGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('AVAILABLE_FIRST');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);
  const visibleItems = sortedItems.slice(0, visibleCount);
  const remaining = sortedItems.length - visibleItems.length;

  function handleSortChange(value: SortOption) {
    setSortBy(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-xs text-ink-soft">
          {items.length} {items.length === 1 ? 'presente' : 'presentes'}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="gift-sort" className="font-body text-xs font-semibold uppercase tracking-wide text-primary-600">
            Ordenar por
          </label>
          <select
            id="gift-sort"
            value={sortBy}
            onChange={(event) => handleSortChange(event.target.value as SortOption)}
            className="rounded-full border border-primary-200 bg-surface px-4 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {Object.entries(sortLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <GiftCard key={item.id} item={item} eventId={eventId} />
        ))}
      </div>

      {remaining > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          className="mx-auto"
        >
          Ver mais presentes ({remaining})
        </Button>
      )}
    </div>
  );
}
