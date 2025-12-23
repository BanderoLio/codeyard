'use client';

import { useState, lazy, Suspense } from 'react';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useTaskDetail, useTaskMetadata } from '../hooks/use-task-detail';
import { TaskDetailPresentation } from './task-detail-presentation';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { ErrorDisplay } from '@/components/error-display';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

const SolutionFormLazy = lazy(() =>
  import('./solution-form').then((mod) => ({
    default: mod.SolutionForm,
  })),
);

type TTaskDetailContainerProps = {
  taskId: number;
};

export function TaskDetailContainer({ taskId }: TTaskDetailContainerProps) {
  const t = useTranslations('TaskDetail');
  const user = useAppStoreApi().use.user();
  const [showSolutionForm, setShowSolutionForm] = useState(false);

  const {
    data: task,
    isLoading: taskLoading,
    error: taskError,
    refetch: refetchTask,
  } = useTaskDetail(taskId);

  const { categories, difficulties } = useTaskMetadata();

  if (taskLoading) {
    return (
      <div
        className="container mx-auto max-w-4xl px-4 py-4 sm:py-8"
        role="status"
        aria-label={t('loadingAria')}
      >
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-4 h-8 w-3/4" />
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="mb-8 h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (taskError) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
        <ErrorDisplay
          title={t('failedToLoadTitle')}
          message={getErrorMessage(taskError)}
          onRetry={() => refetchTask()}
        />
        <div className="mt-4">
          <Button asChild>
            <Link href="/catalog">{t('backToCatalog')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">{t('notFound')}</h1>
          <Button asChild>
            <Link href="/catalog">{t('backToCatalog')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TaskDetailPresentation
      task={task}
      taskId={taskId}
      categories={categories}
      difficulties={difficulties}
      user={user}
      showSolutionForm={showSolutionForm}
      onShowSolutionForm={setShowSolutionForm}
      solutionFormSlot={
        showSolutionForm ? (
          <Suspense
            fallback={
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <Skeleton className="mb-4 h-6 w-48" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="mb-6 h-32 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            }
          >
            <SolutionFormLazy
              taskId={taskId}
              onSuccess={() => {
                setShowSolutionForm(false);
              }}
              onCancel={() => setShowSolutionForm(false)}
            />
          </Suspense>
        ) : null
      }
    />
  );
}
