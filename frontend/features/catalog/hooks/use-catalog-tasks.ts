import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import type { TSortOption } from './use-catalog-filters';

type TUseCatalogTasksProps = {
  search?: string;
  categoryFilter?: number;
  difficultyFilter?: number;
  sortBy: TSortOption;
  page: number;
  myTasksOnly?: boolean;
  solvedByMe?: boolean;
  userId?: number;
};

export function useCatalogTasks({
  search,
  categoryFilter,
  difficultyFilter,
  sortBy,
  page,
  myTasksOnly,
  solvedByMe,
  userId,
}: TUseCatalogTasksProps) {
  const requiresUserId = (myTasksOnly || solvedByMe) && !userId;

  return useQuery({
    queryKey: [
      'tasks',
      search,
      categoryFilter,
      difficultyFilter,
      sortBy,
      page,
      myTasksOnly,
      solvedByMe,
      userId,
    ],
    queryFn: () => {
      const filters: Parameters<typeof catalogApi.getTasks>[0] = {
        search: search || undefined,
        category: categoryFilter,
        difficulty: difficultyFilter,
        ordering: sortBy,
        page,
      };

      if (myTasksOnly && userId) {
        filters.added_by = userId;
      }

      if (solvedByMe && userId) {
        filters.solved_by = userId;
      }

      return catalogApi.getTasks(filters);
    },
    enabled: !requiresUserId,
  });
}
