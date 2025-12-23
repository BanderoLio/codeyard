'use client';

import { SolutionForm } from './solution-form';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import type { TSolution } from '../types';
import type { BreadcrumbItem } from '@/widgets/breadcrumbs';

type TEditSolutionPresentationProps = {
  taskId: number;
  solutionId: number;
  solution: TSolution;
  breadcrumbItems: BreadcrumbItem[];
  onSuccess: () => void;
  onCancel: () => void;
};

export function EditSolutionPresentation({
  taskId,
  solutionId,
  solution,
  breadcrumbItems,
  onSuccess,
  onCancel,
}: TEditSolutionPresentationProps) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 sm:py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-4" />

      <SolutionForm
        taskId={taskId}
        solutionId={solutionId}
        initialData={{
          code: solution.code,
          language: solution.language,
          explanation: solution.explanation,
        }}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
}
