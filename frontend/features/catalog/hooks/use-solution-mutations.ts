import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import { getTranslatedErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { TReview, TSolution, TCreateReview } from '../types';

type TUseSolutionMutationsProps = {
  solutionId: number;
  taskId: number;
  onPublishError?: (error: string) => void;
  onPublishSuccess?: () => void;
};

export function useSolutionMutations({
  solutionId,
  taskId,
  onPublishError,
  onPublishSuccess,
}: TUseSolutionMutationsProps) {
  const t = useTranslations('TaskDetail');
  const tErrors = useTranslations('Errors');
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: catalogApi.createReview,
    onMutate: async (newReview: TCreateReview) => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      await queryClient.cancelQueries({ queryKey: ['solution', solutionId] });
      const previousSolutions = queryClient.getQueryData(['solutions', taskId]);
      const previousSolution = queryClient.getQueryData([
        'solution',
        solutionId,
      ]);

      queryClient.setQueryData(
        ['solutions', taskId],
        (old: { results: TSolution[]; count: number } | undefined) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((s) => {
              if (s.id === solutionId) {
                const isPositive = newReview.review_type === 1;
                const hadReview = s.user_review !== null;
                const previousWasPositive = s.user_review?.review_type === 1;

                let positiveCount = s.positive_reviews_count || 0;
                let negativeCount = s.negative_reviews_count || 0;

                if (hadReview) {
                  if (previousWasPositive) {
                    positiveCount = Math.max(0, positiveCount - 1);
                  } else {
                    negativeCount = Math.max(0, negativeCount - 1);
                  }
                }

                if (isPositive) {
                  positiveCount += 1;
                } else {
                  negativeCount += 1;
                }

                return {
                  ...s,
                  positive_reviews_count: positiveCount,
                  negative_reviews_count: negativeCount,
                  user_review: {
                    id: s.user_review?.id || Date.now(),
                    review_type: newReview.review_type,
                  },
                };
              }
              return s;
            }),
          };
        },
      );

      queryClient.setQueryData(
        ['solution', solutionId],
        (old: TSolution | undefined) => {
          if (!old) return old;
          const isPositive = newReview.review_type === 1;
          const hadReview = old.user_review !== null;
          const previousWasPositive = old.user_review?.review_type === 1;

          let positiveCount = old.positive_reviews_count || 0;
          let negativeCount = old.negative_reviews_count || 0;

          if (hadReview) {
            if (previousWasPositive) {
              positiveCount = Math.max(0, positiveCount - 1);
            } else {
              negativeCount = Math.max(0, negativeCount - 1);
            }
          }

          if (isPositive) {
            positiveCount += 1;
          } else {
            negativeCount += 1;
          }

          return {
            ...old,
            positive_reviews_count: positiveCount,
            negative_reviews_count: negativeCount,
            user_review: {
              id: old.user_review?.id || Date.now(),
              review_type: newReview.review_type,
            },
          };
        },
      );

      return { previousSolutions, previousSolution };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      if (context?.previousSolution) {
        queryClient.setQueryData(
          ['solution', solutionId],
          context.previousSolution,
        );
      }
      toast.error(getTranslatedErrorMessage(error, tErrors));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
      toast.success(t('reviewSuccess'));
    },
  });

  const publishMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      catalogApi.publishSolution(solutionId, { is_public: isPublic }),
    onMutate: async (isPublic) => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      await queryClient.cancelQueries({ queryKey: ['solution', solutionId] });
      const previousSolutions = queryClient.getQueryData(['solutions', taskId]);
      const previousSolution = queryClient.getQueryData([
        'solution',
        solutionId,
      ]);
      queryClient.setQueryData(
        ['solution', solutionId],
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
          ['solution', solutionId],
          context.previousSolution,
        );
      }
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      const errorMessage = getTranslatedErrorMessage(error, tErrors);
      onPublishError?.(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: (_, isPublic) => {
      onPublishSuccess?.();
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
      toast.success(isPublic ? t('publishSuccess') : t('unpublishSuccess'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => catalogApi.deleteSolution(solutionId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      const previousSolutions = queryClient.getQueryData(['solutions', taskId]);
      queryClient.setQueryData(
        ['solutions', taskId],
        (old: { results: TSolution[]; count: number } | undefined) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.filter((s) => s.id !== solutionId),
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
      const errorMessage = getTranslatedErrorMessage(error, tErrors);
      onPublishError?.(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      toast.success(t('deleteSuccess'));
    },
  });

  return {
    createReviewMutation,
    publishMutation,
    deleteMutation,
  };
}
