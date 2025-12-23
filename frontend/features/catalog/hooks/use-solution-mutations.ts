import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
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
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: catalogApi.createReview,
    onMutate: async (newReview: TCreateReview) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', solutionId] });
      const previousReviews = queryClient.getQueryData(['reviews', solutionId]);
      queryClient.setQueryData(
        ['reviews', solutionId],
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
          ['reviews', solutionId],
          context.previousReviews,
        );
      }
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', solutionId] });
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
      const errorMessage = getErrorMessage(error);
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
      const errorMessage = getErrorMessage(error);
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
