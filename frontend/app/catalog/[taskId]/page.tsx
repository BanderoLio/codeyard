import { TaskDetailPage } from '@/pages/task-detail.page';

type PageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetail({ params }: PageProps) {
  const { taskId } = await params;
  return <TaskDetailPage taskId={Number(taskId)} />;
}
