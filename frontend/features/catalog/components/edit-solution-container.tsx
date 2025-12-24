'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
import { catalogApi } from '../catalog.api';
import { useAuth } from '@/features/auth/use-auth';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { ErrorDisplay } from '@/components/error-display';
import { getTranslatedErrorMessage } from '@/lib/utils/error-handler';
import { useTranslations } from 'next-intl';
import { EditSolutionPresentation } from './edit-solution-presentation';

type TEditSolutionContainerProps = {
  taskId: number;
  solutionId: number;
};

export function EditSolutionContainer({
  taskId,
  solutionId,
}: TEditSolutionContainerProps) {
  const t = useTranslations('TaskDetail');
  const tBreadcrumbs = useTranslations('Breadcrumbs');
  const tErrors = useTranslations('Errors');
  useAuth();
  const router = useRouter();
  const user = useAppStoreApi().use.user();

  const {
    data: solution,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: () => catalogApi.getSolution(solutionId),
  });

  useEffect(() => {
    if (solution && user && solution.user !== user.username) {
      toast.error(t('noPermissionToEdit'));
      router.push(`/catalog/${taskId}`);
    }
  }, [solution, user, router, taskId, t]);

  const breadcrumbItems = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('catalog'), href: '/catalog' },
    { label: tBreadcrumbs('task'), href: `/catalog/${taskId}` },
    { label: tBreadcrumbs('editSolution') },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
        <Skeleton className="mb-4 h-6 w-64" />
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
        <ErrorDisplay
          message={
            error
              ? getTranslatedErrorMessage(error, tErrors)
              : t('solutionNotFound')
          }
          onRetry={error ? () => window.location.reload() : undefined}
        />
      </div>
    );
  }

  if (user && solution.user !== user.username) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
        <ErrorDisplay message={t('noPermissionToEdit')} />
      </div>
    );
  }

  return (
    <EditSolutionPresentation
      taskId={taskId}
      solutionId={solutionId}
      solution={solution}
      breadcrumbItems={breadcrumbItems}
      onSuccess={() => {
        toast.success(t('updateSuccess'));
        router.push(`/catalog/${taskId}`);
      }}
      onCancel={() => {
        router.push(`/catalog/${taskId}`);
      }}
    />
  );
}
