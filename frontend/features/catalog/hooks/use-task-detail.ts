import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';

export function useTaskDetail(taskId: number) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => catalogApi.getTask(taskId),
  });
}

export function useTaskSolutions(taskId: number) {
  return useQuery({
    queryKey: ['solutions', taskId],
    queryFn: () => catalogApi.getSolutions({ task: taskId }),
  });
}

export function useTaskMetadata() {
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const difficulties = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  return {
    categories: categories.data,
    difficulties: difficulties.data,
    isLoading: categories.isLoading || difficulties.isLoading,
  };
}
