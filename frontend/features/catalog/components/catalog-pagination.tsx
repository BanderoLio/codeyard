'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

type TCatalogPaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
};

export function CatalogPagination({
  page,
  totalPages,
  totalCount,
  hasNext,
  hasPrevious,
  onPageChange,
}: TCatalogPaginationProps) {
  const t = useTranslations('Catalog');

  if (!hasNext && !hasPrevious) return null;

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-4"
      aria-label="Pagination"
    >
      <div className="text-muted-foreground text-sm" aria-live="polite">
        {t('page')} {page} {t('of')} {totalPages > 0 ? totalPages : 1} •{' '}
        {totalCount} {totalCount === 1 ? t('task') : t('tasks')}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!hasPrevious}
          aria-label={t('previous')}
        >
          {t('previous')}
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          aria-label={t('next')}
        >
          {t('next')}
        </Button>
      </div>
    </nav>
  );
}
