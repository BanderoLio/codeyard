'use client';

import { Link } from '@/navigation';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/code-block';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useTranslations } from 'next-intl';
import type { TSolution } from '../types';
import { useSolutionMutations } from '../hooks/use-solution-mutations';
import { useState } from 'react';

type TSolutionCardProps = {
  solution: TSolution;
  taskId: number;
};

export function SolutionCard({ solution, taskId }: TSolutionCardProps) {
  const t = useTranslations('TaskDetail');
  const user = useAppStoreApi().use.user();
  const [publishError, setPublishError] = useState<string | null>(null);

  const { createReviewMutation, publishMutation, deleteMutation } =
    useSolutionMutations({
      solutionId: solution.id,
      taskId,
      onPublishError: setPublishError,
      onPublishSuccess: () => setPublishError(null),
    });

  const positiveReviews = solution.positive_reviews_count || 0;
  const negativeReviews = solution.negative_reviews_count || 0;
  const userReview = solution.user_review;

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
