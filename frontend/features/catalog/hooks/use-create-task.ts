import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
import { catalogApi } from '../catalog.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type TCreateTaskData = {
  name: string;
  description: string;
  resource?: string;
  category: number;
  difficulty: number;
};

export function useCreateTask() {
  const t = useTranslations('CreateTask');
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TCreateTaskData) => catalogApi.createTask(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('createSuccess'));
      const taskId = data?.id;
      if (taskId !== undefined && taskId !== null) {
        const id = Number(taskId);
        if (!isNaN(id) && id > 0) {
          router.push(`/catalog/${id}`);
          return;
        }
      }
      const errorMessage = t('failedToCreateTask');
      toast.error(errorMessage);
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
