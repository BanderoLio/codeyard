import { EditSolutionPage } from '@/views/catalog/edit-solution.page';

type PageProps = {
  params: Promise<{ locale: string; taskId: string; solutionId: string }>;
};

export default async function EditSolution({ params }: PageProps) {
  const { taskId, solutionId } = await params;

  return (
    <EditSolutionPage taskId={Number(taskId)} solutionId={Number(solutionId)} />
  );
}
