'use client';

import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskHeader } from './task-header';
import { SolutionsListContainer } from './solutions-list-container';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import type { TProgrammingTask, TCategory, TDifficulty } from '../types';
import type { ReactNode } from 'react';

type TTaskDetailPresentationProps = {
  task: TProgrammingTask;
  taskId: number;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
  user: { username: string } | null;
  showSolutionForm: boolean;
  onShowSolutionForm: (show: boolean) => void;
  solutionFormSlot: ReactNode;
};

export function TaskDetailPresentation({
  task,
  taskId,
  categories,
  difficulties,
  onShowSolutionForm,
  solutionFormSlot,
}: TTaskDetailPresentationProps) {
  const t = useTranslations('TaskDetail');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <Breadcrumbs
        items={[
          { label: t('home'), href: '/' },
          { label: t('catalog'), href: '/catalog' },
          { label: task.name, isActive: true },
        ]}
        className="mb-4"
      />
      <TaskHeader
        task={task}
        categories={categories}
        difficulties={difficulties}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{t('solutions')}</h2>
        <Button
          onClick={() => onShowSolutionForm(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addSolution')}
        </Button>
      </div>

      {solutionFormSlot && <div className="mb-6">{solutionFormSlot}</div>}

      <SolutionsListContainer
        taskId={taskId}
        onAddSolution={() => onShowSolutionForm(true)}
      />

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/catalog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToCatalog')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
