import { apiClient } from '@/lib/api-client';
import type {
  TCategory,
  TDifficulty,
  TProgrammingLanguage,
  TProgrammingTask,
  TCreateSolution,
  TSolution,
  TUpdateSolution,
  TPublishSolution,
  TReview,
  TCreateReview,
} from './types';

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type TaskFilters = {
  category?: number;
  difficulty?: number;
  search?: string;
  status?: string;
  ordering?: string;
  page?: number;
};

type SolutionFilters = {
  task?: number;
  is_public?: boolean;
  language?: number;
  user?: number;
  page?: number;
};

export const catalogApi = {
  getCategories: async (): Promise<TCategory[]> => {
    const response = await apiClient.get<TCategory[], '/api/categories/'>(
      '/api/categories/',
    );
    return response.data || [];
  },

  getDifficulties: async (): Promise<TDifficulty[]> => {
    const response = await apiClient.get<TDifficulty[], '/api/difficulties/'>(
      '/api/difficulties/',
    );
    return response.data || [];
  },

  getLanguages: async (): Promise<TProgrammingLanguage[]> => {
    const response = await apiClient.get<
      TProgrammingLanguage[],
      '/api/languages/'
    >('/api/languages/');
    return response.data || [];
  },

  getTasks: async (
    filters?: TaskFilters,
  ): Promise<PaginatedResponse<TProgrammingTask>> => {
    const params = new URLSearchParams();
    if (filters?.category) {
      params.append('category', filters.category.toString());
    }
    if (filters?.difficulty) {
      params.append('difficulty', filters.difficulty.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.ordering) {
      params.append('ordering', filters.ordering);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }

    const response = await apiClient.get<
      PaginatedResponse<TProgrammingTask>,
      '/api/tasks/'
    >('/api/tasks/', params);
    return response.data;
  },

  getTask: async (id: number): Promise<TProgrammingTask> => {
    const response = await apiClient.get<
      TProgrammingTask,
      `/api/tasks/${number}/`
    >(`/api/tasks/${id}/`);
    return response.data;
  },

  createTask: async (
    data: Omit<
      TProgrammingTask,
      'id' | 'added_by' | 'created_at' | 'updated_at' | 'status'
    >,
  ): Promise<TProgrammingTask> => {
    const response = await apiClient.post<
      TProgrammingTask,
      '/api/tasks/',
      typeof data
    >('/api/tasks/', data);
    return response.data;
  },

  updateTask: async (
    id: number,
    data: Partial<
      Omit<TProgrammingTask, 'id' | 'added_by' | 'created_at' | 'updated_at'>
    >,
  ): Promise<TProgrammingTask> => {
    const response = await apiClient.patch<
      TProgrammingTask,
      `/api/tasks/${number}/`,
      typeof data
    >(`/api/tasks/${id}/`, data);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}/`);
  },

  getSolutions: async (
    filters?: SolutionFilters,
  ): Promise<PaginatedResponse<TSolution>> => {
    const params = new URLSearchParams();
    if (filters?.task) {
      params.append('task', filters.task.toString());
    }
    if (filters?.is_public !== undefined) {
      params.append('is_public', filters.is_public.toString());
    }
    if (filters?.language) {
      params.append('language', filters.language.toString());
    }
    if (filters?.user) {
      params.append('user', filters.user.toString());
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }

    const response = await apiClient.get<
      PaginatedResponse<TSolution>,
      '/api/solutions/'
    >('/api/solutions/', params);
    return response.data;
  },

  getSolution: async (id: number): Promise<TSolution> => {
    const response = await apiClient.get<
      TSolution,
      `/api/solutions/${number}/`
    >(`/api/solutions/${id}/`);
    return response.data;
  },

  createSolution: async (data: TCreateSolution): Promise<TSolution> => {
    const response = await apiClient.post<
      TSolution,
      '/api/solutions/',
      TCreateSolution
    >('/api/solutions/', data);
    return response.data;
  },

  updateSolution: async (
    id: number,
    data: TUpdateSolution,
  ): Promise<TSolution> => {
    const response = await apiClient.patch<
      TSolution,
      `/api/solutions/${number}/`,
      TUpdateSolution
    >(`/api/solutions/${id}/`, data);
    return response.data;
  },

  deleteSolution: async (id: number): Promise<void> => {
    await apiClient.delete<void, `/api/solutions/${number}/`>(
      `/api/solutions/${id}/`,
    );
  },

  publishSolution: async (
    id: number,
    data: TPublishSolution,
  ): Promise<TSolution> => {
    const response = await apiClient.post<
      TSolution,
      `/api/solutions/${number}/publish/`,
      TPublishSolution
    >(`/api/solutions/${id}/publish/`, data);
    return response.data;
  },

  getReviews: async (solutionId?: number): Promise<TReview[]> => {
    const params = solutionId
      ? new URLSearchParams({ solution: solutionId.toString() })
      : undefined;
    const response = await apiClient.get<
      PaginatedResponse<TReview>,
      '/api/reviews/'
    >('/api/reviews/', params);
    return response.data.results;
  },

  createReview: async (data: TCreateReview): Promise<TReview> => {
    const response = await apiClient.post<
      TReview,
      '/api/reviews/',
      TCreateReview
    >('/api/reviews/', data);
    return response.data;
  },
};
