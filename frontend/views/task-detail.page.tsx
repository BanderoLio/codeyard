import { TaskDetailContainer } from '@/features/catalog/components/task-detail-container';

export function TaskDetailPage({ taskId }: { taskId: number }) {
  return <TaskDetailContainer taskId={taskId} />;
}
