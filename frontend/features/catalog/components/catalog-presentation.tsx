'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TaskCard,
  TaskCardSkeleton,
  CatalogFilters,
  CatalogPagination,
} from '../index';
import { ErrorDisplay } from '@/components/error-display';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { useTranslations } from 'next-intl';
import type { TProgrammingTask, TCategory, TDifficulty } from '../types';
import type { TSortOption } from '../hooks/use-catalog-filters';

type TCatalogFiltersState = {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter?: number;
  setCategoryFilter: (value: number | undefined) => void;
  difficultyFilter?: number;
  setDifficultyFilter: (value: number | undefined) => void;
  sortBy: TSortOption;
  setSortBy: (value: TSortOption) => void;
  page: number;
  setPage: (value: number) => void;
  resetPage: () => void;
  debouncedSearch: string;
};

type TCatalogPresentationProps = {
  tasks: TProgrammingTask[];
  categories?: TCategory[];
  difficulties?: TDifficulty[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  filters: TCatalogFiltersState;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
  totalCount: number;
  onCreateTask: () => void;
};

export function CatalogPresentation({
  tasks,
  categories,
  difficulties,
  isLoading,
  error,
  onRetry,
  filters,
  hasNext,
  hasPrevious,
  totalPages,
  totalCount,
  onCreateTask,
}: TCatalogPresentationProps) {
  const t = useTranslations('Catalog');

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
        <Button onClick={onCreateTask} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('createTask')}
        </Button>
      </div>

      <CatalogFilters
        search={filters.search}
        onSearchChange={(value) => {
          filters.setSearch(value);
          filters.resetPage();
        }}
        categoryFilter={filters.categoryFilter}
        onCategoryChange={(value) => {
          filters.setCategoryFilter(value);
          filters.resetPage();
        }}
        difficultyFilter={filters.difficultyFilter}
        onDifficultyChange={(value) => {
          filters.setDifficultyFilter(value);
          filters.resetPage();
        }}
        sortBy={filters.sortBy}
        onSortChange={(value) => {
          filters.setSortBy(value);
          filters.resetPage();
        }}
        categories={categories}
        difficulties={difficulties}
      />

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading tasks"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
          <span className="sr-only">Loading tasks...</span>
        </div>
      ) : error ? (
        <ErrorDisplay
          message={getErrorMessage(error)}
          onRetry={onRetry}
          className="mx-auto max-w-2xl"
        />
      ) : tasks.length === 0 ? (
        <div className="bg-card border-muted flex flex-col items-center justify-center rounded-lg border py-12 text-center sm:py-16">
          <div className="mb-4 text-4xl sm:text-6xl">📋</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">
            {t('noTasks')}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md px-4 text-sm sm:text-base">
            {t('noTasksDesc')}
          </p>
          {!filters.debouncedSearch &&
            !filters.categoryFilter &&
            !filters.difficultyFilter && (
              <Button onClick={onCreateTask} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t('createTask')}
              </Button>
            )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                difficulties={difficulties}
              />
            ))}
          </div>

          <CatalogPagination
            page={filters.page}
            totalPages={totalPages}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={filters.setPage}
          />
        </>
      )}
    </>
  );
}
