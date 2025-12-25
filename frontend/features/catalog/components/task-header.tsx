'use client';

import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TProgrammingTask, TCategory, TDifficulty } from '../types';

type TTaskHeaderProps = {
  task: TProgrammingTask;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
};

export function TaskHeader({
  task,
  categories,
  difficulties,
}: TTaskHeaderProps) {
  const t = useTranslations('TaskDetail');
  const category = categories?.find((c) => c.id === task.category);
  const difficulty = difficulties?.find((d) => d.id === task.difficulty);

  return (
    <div className="mb-6">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{task.name}</h1>
      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label={`${t('category')}, ${t('difficulty')}`}
      >
        {category && (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
            {category.name}
          </span>
        )}
        {difficulty && (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
            {difficulty.name}
          </span>
        )}
      </div>
      {task.resource && (
        <a
          href={task.resource}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mb-4 inline-flex items-center gap-1 hover:underline"
          aria-label={`${t('viewOriginal')} (${t('opensInNewTab')})`}
        >
          {t('viewOriginal')}{' '}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <p className="text-muted-foreground mt-4 wrap-break-word whitespace-pre-wrap">
        {task.description}
      </p>
    </div>
  );
}
