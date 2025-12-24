import { TaskDetailPage } from '@/views/task-detail.page';

type PageProps = {
  params: Promise<{ locale: string; taskId: string }>;
};

export default async function TaskDetail({ params }: PageProps) {
  const { taskId } = await params;
  return <TaskDetailPage taskId={Number(taskId)} />;
}
