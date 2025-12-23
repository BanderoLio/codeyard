'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, Link } from '@/navigation';
import { catalogApi } from '@/features/catalog/catalog.api';
import { SolutionForm } from '@/features/catalog/components/solution-form';
import { useAuth } from '@/features/auth/use-auth';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ErrorDisplay } from '@/components/error-display';
import { getErrorMessage } from '@/lib/utils/error-handler';

type EditSolutionPageProps = {
  taskId: number;
  solutionId: number;
};

export function EditSolutionPage({
  taskId,
  solutionId,
}: EditSolutionPageProps) {
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
      toast.error('You do not have permission to edit this solution');
      router.push(`/catalog/${taskId}`);
    }
  }, [solution, user, router, taskId]);

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
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog">Catalog</Link>{' '}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/catalog/${taskId}`}>Task</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Solution</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ErrorDisplay
          message={error ? getErrorMessage(error) : 'Solution not found'}
          onRetry={error ? () => window.location.reload() : undefined}
        />
      </div>
    );
  }

  if (user && solution.user !== user.username) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog">Catalog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/catalog/${taskId}`}>Task</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Solution</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ErrorDisplay message="You do not have permission to edit this solution" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/catalog">Catalog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/catalog/${taskId}`}>Task</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Solution</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SolutionForm
        taskId={taskId}
        solutionId={solutionId}
        initialData={{
          code: solution.code,
          language: solution.language,
          explanation: solution.explanation,
        }}
        onSuccess={() => {
          toast.success('Solution updated successfully');
          router.push(`/catalog/${taskId}`);
        }}
        onCancel={() => {
          router.push(`/catalog/${taskId}`);
        }}
      />
    </div>
  );
}
