import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import type { TSortOption } from './use-catalog-filters';

type TUseCatalogTasksProps = {
  search?: string;
  categoryFilter?: number;
  difficultyFilter?: number;
  sortBy: TSortOption;
  page: number;
};

export function useCatalogTasks({
  search,
  categoryFilter,
  difficultyFilter,
  sortBy,
  page,
}: TUseCatalogTasksProps) {
  return useQuery({
    queryKey: ['tasks', search, categoryFilter, difficultyFilter, sortBy, page],
    queryFn: () =>
      catalogApi.getTasks({
        search: search || undefined,
        category: categoryFilter,
        difficulty: difficultyFilter,
        ordering: sortBy,
        page,
      }),
  });
}
