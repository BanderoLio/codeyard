'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@/navigation';
import { catalogApi } from '../catalog.api';
import type { TProgrammingTask, TCategory, TDifficulty } from '../types';
import { useTranslations } from 'next-intl';

type TTaskCardProps = {
  task: TProgrammingTask;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
};

export function TaskCard({ task, categories, difficulties }: TTaskCardProps) {
  const t = useTranslations('Catalog');
  const queryClient = useQueryClient();
  const category = categories?.find((c) => c.id === task.category);
  const difficulty = difficulties?.find((d) => d.id === task.difficulty);

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['task', task.id],
      queryFn: () => catalogApi.getTask(task.id),
    });
    queryClient.prefetchQuery({
      queryKey: ['solutions', task.id],
      queryFn: () => catalogApi.getSolutions({ task: task.id }),
    });
  };

  return (
    <Link
      href={`/catalog/${task.id}`}
      className="block h-full"
      aria-label={`View task: ${task.name}`}
      onMouseEnter={handleMouseEnter}
    >
      <article className="group bg-card hover:border-primary/50 h-full rounded-lg border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <h3 className="card-foreground group-hover:text-primary text-lg font-semibold transition-colors duration-200">
          {task.name}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {task.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {category && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-medium">
              {category.name}
            </span>
          )}
          {difficulty && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-medium">
              {difficulty.name}
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 border-t pt-3 text-xs">
          <span className="font-medium">
            {t('by')} {task.added_by}
          </span>
          <span>•</span>
          <time dateTime={task.created_at}>
            {new Date(task.created_at).toLocaleDateString()}
          </time>
        </div>
      </article>
    </Link>
  );
}
