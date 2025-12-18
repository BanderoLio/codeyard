import { EditSolutionPage } from '@/pages/catalog/edit-solution.page';

type PageProps = {
  params: Promise<{ taskId: string; solutionId: string }>;
};

export default async function EditSolution({ params }: PageProps) {
  const { taskId, solutionId } = await params;
  return (
    <EditSolutionPage
      taskId={Number(taskId)}
      solutionId={Number(solutionId)}
    />
  );
}
