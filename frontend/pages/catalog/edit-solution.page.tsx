'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { catalogApi } from '@/features/catalog/catalog.api';
import { SolutionForm } from '@/features/catalog/components/solution-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/features/auth/use-auth';

type EditSolutionPageProps = {
  taskId: number;
  solutionId: number;
};

export function EditSolutionPage({
  taskId,
  solutionId,
}: EditSolutionPageProps) {
  useAuth();
  const router = useRouter();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: () => catalogApi.getSolution(solutionId),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-muted-foreground text-center">Loading...</div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Solution not found</h1>
          <Button asChild>
            <Link href={`/catalog/${taskId}`}>Back to Task</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/catalog/${taskId}`}>← Back to Task</Link>
        </Button>
      </div>

      <SolutionForm
        taskId={taskId}
        solutionId={solutionId}
        initialData={{
          code: solution.code,
          language: solution.language,
          explanation: solution.explanation,
        }}
        onSuccess={() => {
          router.push(`/catalog/${taskId}`);
        }}
        onCancel={() => {
          router.push(`/catalog/${taskId}`);
        }}
      />
    </div>
  );
}

