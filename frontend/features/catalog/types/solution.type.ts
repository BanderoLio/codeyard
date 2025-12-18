import type { TProgrammingTaskDetail } from './task.type';

export type TSolution = {
  id: number;
  task: number;
  task_detail?: TProgrammingTaskDetail;
  code: string;
  language: number;
  language_name?: string;
  explanation: string;
  user: string;
  is_public: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TCreateSolution = {
  task: number;
  code: string;
  language: number;
  explanation: string;
};

export type TUpdateSolution = Partial<Omit<TCreateSolution, 'task'>>;

export type TPublishSolution = {
  is_public: boolean;
};
