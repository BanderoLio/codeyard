'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import { useCatalogFilters } from '../hooks/use-catalog-filters';
import { useCatalogTasks } from '../hooks/use-catalog-tasks';
import { CatalogPresentation } from './catalog-presentation';

export function CatalogContainer() {
  const filters = useCatalogFilters();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });
  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useCatalogTasks({
    search: filters.debouncedSearch,
    categoryFilter: filters.categoryFilter,
    difficultyFilter: filters.difficultyFilter,
    sortBy: filters.sortBy,
    page: filters.page,
  });

  const tasks = tasksData?.results || [];
  const hasNext = !!tasksData?.next;
  const hasPrevious = !!tasksData?.previous;
  const totalCount = tasksData?.count || 0;
  const pageSize = 20;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <CatalogPresentation
      tasks={tasks}
      categories={categories}
      difficulties={difficulties}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      filters={filters}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
}
