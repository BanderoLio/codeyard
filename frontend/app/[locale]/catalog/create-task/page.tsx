import { CreateTaskPage } from '@/views/catalog/create-task.page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CreateTask({ params }: PageProps) {
  await params;
  return <CreateTaskPage />;
}
