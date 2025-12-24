'use client';

import { useState } from 'react';
import { useTaskSolutions } from '../hooks/use-task-detail';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { SolutionsListPresentation } from './solutions-list-presentation';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { useRequireAuth } from '@/features/auth/hooks/use-require-auth';

type TSolutionsListContainerProps = {
  taskId: number;
  onAddSolution: () => void;
};

export function SolutionsListContainer({
  taskId,
  onAddSolution,
}: TSolutionsListContainerProps) {
  const user = useAppStoreApi().use.user();
  const { requireAuth, showAuthModal, setShowAuthModal } = useRequireAuth();
  const [page, setPage] = useState(1);

  const handleAddSolution = () => {
    requireAuth(onAddSolution);
  };
  const {
    data: solutionsData,
    isLoading,
    error,
    refetch,
  } = useTaskSolutions(taskId, page);

  const solutions = solutionsData?.results || [];
  const publicSolutions = solutions.filter((s) => s.is_public);
  const userSolutions = user
    ? solutions.filter((s) => s.user === user.username)
    : [];
  const hasNext = !!solutionsData?.next;
  const hasPrevious = !!solutionsData?.previous;
  const totalCount = solutionsData?.count || 0;
  const pageSize = 20;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <>
      <SolutionsListPresentation
        solutions={solutions}
        taskId={taskId}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onAddSolution={handleAddSolution}
        userSolutions={userSolutions}
        publicSolutions={publicSolutions}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={setPage}
      />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
