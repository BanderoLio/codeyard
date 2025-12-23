'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/catalog.api';
import { Button } from '@/components/ui/button';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { Link } from '@/navigation';
import { Plus, ThumbsUp, ThumbsDown, ExternalLink, Trash2 } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SolutionForm = lazy(() =>
  import('@/features/catalog/components/solution-form').then((mod) => ({
    default: mod.SolutionForm,
  })),
);

import { getErrorMessage } from '@/lib/utils/error-handler';
import { CodeBlock } from '@/components/code-block';
import { toast } from 'sonner';
import { ErrorDisplay } from '@/components/error-display';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { TReview, TSolution } from '@/features/catalog/types';
import { useTranslations } from 'next-intl';

function SolutionCard({
  solution,
  taskId,
}: {
  solution: TSolution;
  taskId: number;
}) {
  const t = useTranslations('TaskDetail');
  const user = useAppStoreApi().use.user();
  const queryClient = useQueryClient();
  const [publishError, setPublishError] = useState<string | null>(null);

  const { data: reviews } = useQuery({
    queryKey: ['reviews', solution.id],
    queryFn: () => catalogApi.getReviews(solution.id),
  });

  const createReviewMutation = useMutation({
    mutationFn: catalogApi.createReview,
    onMutate: async (newReview) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', solution.id] });
      const previousReviews = queryClient.getQueryData([
        'reviews',
        solution.id,
      ]);
      queryClient.setQueryData(
        ['reviews', solution.id],
        (old: TReview[] | undefined) => {
          if (!old) return [{ ...newReview, id: Date.now() } as TReview];
          return [...old, { ...newReview, id: Date.now() } as TReview];
        },
      );
      return { previousReviews };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(
          ['reviews', solution.id],
          context.previousReviews,
        );
      }
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', solution.id] });
      toast.success(t('reviewSuccess'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      catalogApi.publishSolution(solution.id, { is_public: isPublic }),
    onMutate: async (isPublic) => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      await queryClient.cancelQueries({ queryKey: ['solution', solution.id] });
      const previousSolutions = queryClient.getQueryData(['solutions', taskId]);
      const previousSolution = queryClient.getQueryData([
        'solution',
        solution.id,
      ]);
      queryClient.setQueryData(
        ['solution', solution.id],
        (old: TSolution | undefined) => {
          if (!old) return old;
          return {
            ...old,
            is_public: isPublic,
            published_at: isPublic ? new Date().toISOString() : null,
          };
        },
      );
      return { previousSolutions, previousSolution };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousSolution) {
        queryClient.setQueryData(
          ['solution', solution.id],
          context.previousSolution,
        );
      }
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      const errorMessage = getErrorMessage(error);
      setPublishError(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: () => {
      setPublishError(null);
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solution.id] });
      toast.success(
        solution.is_public ? t('unpublishSuccess') : t('publishSuccess'),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => catalogApi.deleteSolution(solution.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      const previousSolutions = queryClient.getQueryData(['solutions', taskId]);
      queryClient.setQueryData(
        ['solutions', taskId],
        (old: { results: TSolution[]; count: number } | undefined) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.filter((s) => s.id !== solution.id),
            count: old.count - 1,
          };
        },
      );
      return { previousSolutions };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      const errorMessage = getErrorMessage(error);
      setPublishError(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      toast.success(t('deleteSuccess'));
    },
  });

  const positiveReviews =
    reviews?.filter((r) => r.review_type === 1).length || 0;
  const negativeReviews =
    reviews?.filter((r) => r.review_type === 0).length || 0;
  const userReview = reviews?.find((r) => r.added_by === user?.username);

  const canReview = user && user.username !== solution.user && !userReview;
  const isOwner = user?.username === solution.user;

  return (
    <article className="bg-card rounded-lg border p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold sm:text-lg">
              {solution.language_name || t('unknownLanguage')}
            </h3>
            {solution.is_public && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {t('public')}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('by')} {solution.user} •{' '}
            {new Date(solution.created_at).toLocaleDateString()}
            {solution.is_public && solution.published_at && (
              <>
                {' • '}
                {t('published')}{' '}
                {new Date(solution.published_at).toLocaleDateString()}
              </>
            )}
          </p>
        </div>
        {isOwner && (
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              {!solution.is_public && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPublishError(null);
                    publishMutation.mutate(true);
                  }}
                  disabled={publishMutation.isPending}
                  aria-label={t('publishAria')}
                >
                  {publishMutation.isPending ? t('publishing') : t('publish')}
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/catalog/${taskId}/solutions/${solution.id}/edit`}>
                  {t('edit')}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm(t('deleteConfirm'))) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                aria-label={t('deleteAria')}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {publishError && (
              <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-2 text-xs">
                {publishError}
              </div>
            )}
          </div>
        )}
      </div>

      {solution.explanation && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">{t('explanation')}</h4>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {solution.explanation}
          </p>
        </div>
      )}

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold" id={`code-${solution.id}`}>
          {t('code')}
        </h4>
        <div role="region" aria-labelledby={`code-${solution.id}`}>
          <CodeBlock
            code={solution.code}
            language={solution.language_name}
            showCopyButton
          />
        </div>
      </div>

      {canReview && (
        <div className="flex gap-2" role="group" aria-label={t('reviewAria')}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              createReviewMutation.mutate({
                solution: solution.id,
                review_type: 1,
              });
            }}
            disabled={createReviewMutation.isPending}
            aria-label={t('likeAria')}
          >
            <ThumbsUp className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('like')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              createReviewMutation.mutate({
                solution: solution.id,
                review_type: 0,
              });
            }}
            disabled={createReviewMutation.isPending}
            aria-label={t('dislikeAria')}
          >
            <ThumbsDown className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('dislike')}
          </Button>
        </div>
      )}

      {(positiveReviews > 0 || negativeReviews > 0) && (
        <div
          className="mt-4 flex gap-4 text-sm"
          role="group"
          aria-label={t('reviewsSummaryAria')}
        >
          <span className="text-muted-foreground flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            {t('likeCount', { count: positiveReviews })}
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            {t('dislikeCount', { count: negativeReviews })}
          </span>
        </div>
      )}
    </article>
  );
}

export function TaskDetailPage({ taskId }: { taskId: number }) {
  const t = useTranslations('TaskDetail');
  const tBreadcrumbs = useTranslations('Breadcrumbs');
  const user = useAppStoreApi().use.user();
  const [showSolutionForm, setShowSolutionForm] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const {
    data: task,
    isLoading: taskLoading,
    error: taskError,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => catalogApi.getTask(taskId),
  });

  const {
    data: solutionsData,
    isLoading: solutionsLoading,
    error: solutionsError,
    refetch: refetchSolutions,
  } = useQuery({
    queryKey: ['solutions', taskId],
    queryFn: () => catalogApi.getSolutions({ task: taskId }),
  });

  const solutions = solutionsData?.results || [];
  const publicSolutions = solutions.filter((s) => s.is_public);
  const userSolutions = user
    ? solutions.filter((s) => s.user === user.username)
    : [];

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
          title="Failed to load task"
          message={getErrorMessage(taskError)}
          onRetry={() => refetchTask()}
        />
        <div className="mt-4">
          <Button asChild>
            <Link href="/catalog">Back to Catalog</Link>
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
    <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{tBreadcrumbs('home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/catalog">{tBreadcrumbs('catalog')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-none">
              {task.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{task.name}</h1>
        <div
          className="mb-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t('category') + ', ' + t('difficulty')}
        >
          {categories?.find((c) => c.id === task.category) && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
              {categories.find((c) => c.id === task.category)?.name}
            </span>
          )}
          {difficulties?.find((d) => d.id === task.difficulty) && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
              {difficulties.find((d) => d.id === task.difficulty)?.name}
            </span>
          )}
        </div>
        {task.resource && (
          <a
            href={task.resource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mb-4 inline-flex items-center gap-1 hover:underline"
            aria-label={`${t('viewOriginal')} (${t('opensInNewTab')})`}
          >
            {t('viewOriginal')}{' '}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
        <p className="text-muted-foreground mt-4 whitespace-pre-wrap">
          {task.description}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{t('solutions')}</h2>
        {user && (
          <Button
            onClick={() => setShowSolutionForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addSolution')}
          </Button>
        )}
      </div>

      {showSolutionForm && (
        <div className="mb-6">
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
            <SolutionForm
              taskId={taskId}
              onSuccess={() => {
                setShowSolutionForm(false);
              }}
              onCancel={() => setShowSolutionForm(false)}
            />
          </Suspense>
        </div>
      )}

      {solutionsLoading ? (
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
      ) : solutionsError ? (
        <ErrorDisplay
          title={t('failedToLoadSolutions')}
          message={getErrorMessage(solutionsError)}
          onRetry={() => refetchSolutions()}
        />
      ) : (
        <div className="space-y-4">
          {userSolutions.length > 0 && (
            <section aria-labelledby="my-solutions-heading">
              <h3
                id="my-solutions-heading"
                className="mb-4 text-xl font-semibold"
              >
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
                {userSolutions.length > 0
                  ? t('publicSolutions')
                  : t('solutions')}
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
              <div className="mb-4 text-4xl sm:text-6xl" aria-hidden="true">
                💡
              </div>
              <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                {t('noSolutions')}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md px-4 text-sm sm:text-base">
                {t('noSolutionsDesc')}
              </p>
              {user && (
                <Button
                  onClick={() => setShowSolutionForm(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t('addSolution')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
