import { EditSolutionContainer } from '@/features/catalog/components/edit-solution-container';

type EditSolutionPageProps = {
  taskId: number;
  solutionId: number;
};

export function EditSolutionPage({
  taskId,
  solutionId,
}: EditSolutionPageProps) {
  return <EditSolutionContainer taskId={taskId} solutionId={solutionId} />;
}
