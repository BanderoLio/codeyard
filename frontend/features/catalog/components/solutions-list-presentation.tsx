'use client';

import { Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-display';
import { getTranslatedErrorMessage } from '@/lib/utils/error-handler';
import { SolutionCard } from './solution-card';
import { useTranslations } from 'next-intl';
import type { TSolution } from '../types';
import { CatalogPagination } from './catalog-pagination';

type TSolutionsListPresentationProps = {
  solutions: TSolution[];
  taskId: number;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onAddSolution: () => void;
  userSolutions: TSolution[];
  publicSolutions: TSolution[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
};

export function SolutionsListPresentation({
  solutions,
  taskId,
  isLoading,
  error,
  onRetry,
  onAddSolution,
  userSolutions,
  publicSolutions,
  page,
  totalPages,
  totalCount,
  hasNext,
  hasPrevious,
  onPageChange,
}: TSolutionsListPresentationProps) {
  const t = useTranslations('TaskDetail');
  const tErrors = useTranslations('Errors');

  if (isLoading) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label={t('loadingSolutions')}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-1/4" />
            <Skeleton className="mb-4 h-4 w-full" />
            <Skeleton className="mb-4 h-32 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
        <span className="sr-only">{t('loadingSolutions')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title={t('failedToLoadSolutions')}
        message={getTranslatedErrorMessage(error, tErrors)}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-4">
      {userSolutions.length > 0 && (
        <section aria-labelledby="my-solutions-heading">
          <h3 id="my-solutions-heading" className="mb-4 text-xl font-semibold">
            {t('mySolutions')}
          </h3>
          <div className="space-y-4" role="list">
            {userSolutions.map((solution) => (
              <div key={solution.id} role="listitem">
                <SolutionCard solution={solution} taskId={taskId} />
              </div>
            ))}
          </div>
        </section>
      )}

      {publicSolutions.length > 0 && (
        <section aria-labelledby="public-solutions-heading">
          <h3
            id="public-solutions-heading"
            className="mb-4 text-xl font-semibold"
          >
            {userSolutions.length > 0 ? t('publicSolutions') : t('solutions')}
          </h3>
          <div className="space-y-4" role="list">
            {publicSolutions.map((solution) => (
              <div key={solution.id} role="listitem">
                <SolutionCard solution={solution} taskId={taskId} />
              </div>
            ))}
          </div>
        </section>
      )}

      {solutions.length === 0 && (
        <div
          className="bg-card border-muted flex flex-col items-center justify-center rounded-lg border py-12 text-center sm:py-16"
          role="status"
        >
          <Lightbulb
            className="text-muted-foreground mb-4 h-16 w-16 sm:h-24 sm:w-24"
            aria-hidden="true"
          />
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">
            {t('noSolutions')}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md px-4 text-sm sm:text-base">
            {t('noSolutionsDesc')}
          </p>
          <Button onClick={onAddSolution} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('addSolution')}
          </Button>
        </div>
      )}

      {solutions.length > 0 && (
        <CatalogPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
