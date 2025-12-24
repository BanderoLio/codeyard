'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import { useCatalogFilters } from '../hooks/use-catalog-filters';
import { useCatalogTasks } from '../hooks/use-catalog-tasks';
import { CatalogPresentation } from './catalog-presentation';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { useRequireAuth } from '@/features/auth/hooks/use-require-auth';
import { useRouter } from '@/navigation';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';

export function CatalogContainer() {
  const filters = useCatalogFilters();
  const router = useRouter();
  const { requireAuth, showAuthModal, setShowAuthModal } = useRequireAuth();
  const user = useAppStoreApi().use.user();
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
    myTasksOnly: filters.myTasksOnly,
    solvedByMe: filters.solvedByMe,
    userId: user?.id,
  });

  const tasks = tasksData?.results || [];
  const hasNext = !!tasksData?.next;
  const hasPrevious = !!tasksData?.previous;
  const totalCount = tasksData?.count || 0;
  const pageSize = 20;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <>
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
        onCreateTask={() =>
          requireAuth(() => router.push('/catalog/create-task'))
        }
      />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
