import type { TCategory } from './category.type';
import type { TDifficulty } from './difficulty.type';

export type ETaskStatus = 'PRIVATE' | 'PUBLIC' | 'HIDDEN';

export type TProgrammingTask = {
  id: number;
  name: string;
  description: string;
  resource: string;
  difficulty: number;
  category: number;
  added_by: string;
  status: ETaskStatus;
  created_at: string;
  updated_at: string;
};

export type TProgrammingTaskDetail = Omit<
  TProgrammingTask,
  'difficulty' | 'category'
> & {
  difficulty: TDifficulty;
  category: TCategory;
};
