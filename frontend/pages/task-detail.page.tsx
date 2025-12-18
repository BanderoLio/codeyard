'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/catalog.api';
import { Button } from '@/components/ui/button';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import Link from 'next/link';
import {
  Plus,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Copy,
  Trash2,
} from 'lucide-react';
import { SolutionForm } from '@/features/catalog/components/solution-form';
import { useState } from 'react';
import type { TSolution } from '@/features/catalog/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/utils/error-handler';

function SolutionCard({
  solution,
  taskId,
}: {
  solution: TSolution;
  taskId: number;
}) {
  const user = useAppStoreApi().use.user();
  const queryClient = useQueryClient();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(solution.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const { data: reviews } = useQuery({
    queryKey: ['reviews', solution.id],
    queryFn: () => catalogApi.getReviews(solution.id),
  });

  const createReviewMutation = useMutation({
    mutationFn: catalogApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', solution.id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      catalogApi.publishSolution(solution.id, { is_public: isPublic }),
    onSuccess: () => {
      setPublishError(null);
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solution.id] });
    },
    onError: (error: Error) => {
      setPublishError(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => catalogApi.deleteSolution(solution.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
    },
    onError: (error: Error) => {
      setPublishError(getErrorMessage(error));
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
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {solution.language_name || 'Unknown Language'}
            </h3>
            {solution.is_public && (
              <span className="text-muted-foreground text-xs">Public</span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            By {solution.user} •{' '}
            {new Date(solution.created_at).toLocaleDateString()}
          </p>
        </div>
        {isOwner && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {!solution.is_public && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPublishError(null);
                    publishMutation.mutate(true);
                  }}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/catalog/${taskId}/solutions/${solution.id}/edit`}>
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm('Are you sure you want to delete this solution?')
                  ) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
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
          <h4 className="mb-2 text-sm font-semibold">Explanation</h4>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {solution.explanation}
          </p>
        </div>
      )}

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Code</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="bg-muted overflow-x-auto rounded-md p-4 text-sm">
          <code>{solution.code}</code>
        </pre>
      </div>

      {canReview && (
        <div className="flex gap-2">
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
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Like
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
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Dislike
          </Button>
        </div>
      )}

      {(positiveReviews > 0 || negativeReviews > 0) && (
        <div className="mt-4 flex gap-4 text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {positiveReviews}
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            {negativeReviews}
          </span>
        </div>
      )}
    </div>
  );
}

export function TaskDetailPage({ taskId }: { taskId: number }) {
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

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => catalogApi.getTask(taskId),
  });

  const { data: solutionsData, isLoading: solutionsLoading } = useQuery({
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-4 h-8 w-3/4" />
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="mb-8 h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Task not found</h1>
          <Button asChild>
            <Link href="/catalog">Back to Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/catalog">← Back to Catalog</Link>
        </Button>
        <h1 className="mb-2 text-3xl font-bold">{task.name}</h1>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {categories?.find((c) => c.id === task.category) && (
            <span className="bg-muted text-muted-foreground rounded px-3 py-1 text-sm">
              {categories.find((c) => c.id === task.category)?.name}
            </span>
          )}
          {difficulties?.find((d) => d.id === task.difficulty) && (
            <span className="bg-muted text-muted-foreground rounded px-3 py-1 text-sm">
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
          >
            View original task <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <p className="text-muted-foreground mt-4 whitespace-pre-wrap">
          {task.description}
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Solutions</h2>
        {user && (
          <Button onClick={() => setShowSolutionForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Solution
          </Button>
        )}
      </div>

      {showSolutionForm && (
        <div className="mb-6">
          <SolutionForm
            taskId={taskId}
            onSuccess={() => {
              setShowSolutionForm(false);
            }}
            onCancel={() => setShowSolutionForm(false)}
          />
        </div>
      )}

      {solutionsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 shadow-sm">
              <Skeleton className="mb-4 h-6 w-1/4" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="mb-4 h-32 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {userSolutions.length > 0 && (
            <div>
              <h3 className="mb-4 text-xl font-semibold">My Solutions</h3>
              <div className="space-y-4">
                {userSolutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    taskId={taskId}
                  />
                ))}
              </div>
            </div>
          )}

          {publicSolutions.length > 0 && (
            <div>
              <h3 className="mb-4 text-xl font-semibold">
                {userSolutions.length > 0 ? 'Public Solutions' : 'Solutions'}
              </h3>
              <div className="space-y-4">
                {publicSolutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    taskId={taskId}
                  />
                ))}
              </div>
            </div>
          )}

          {solutions.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No solutions yet. Be the first to add one!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
