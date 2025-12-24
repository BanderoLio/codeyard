'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { catalogApi } from '../catalog.api';
import { useCreateTask } from '../hooks/use-create-task';
import { useAuth } from '@/features/auth/use-auth';
import { CreateTaskPresentation } from './create-task-presentation';
import { createTaskSchema, type TTaskFormData } from '../types/task-form.type';

export function CreateTaskContainer() {
  useAuth();
  const router = useRouter();
  const t = useTranslations('Validation');
  const [error, setError] = useState<string | null>(null);

  const taskSchema = createTaskSchema(t);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const createTaskMutation = useCreateTask();

  const form = useForm<TTaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      resource: '',
      category: undefined,
      difficulty: undefined,
    },
  });

  const onSubmit = (data: TTaskFormData) => {
    setError(null);
    createTaskMutation.mutate({
      name: data.name,
      description: data.description,
      resource:
        data.resource && data.resource.trim() !== ''
          ? data.resource
          : undefined,
      category: data.category,
      difficulty: data.difficulty,
    });
  };

  return (
    <CreateTaskPresentation
      form={form}
      onSubmit={onSubmit}
      categories={categories}
      difficulties={difficulties}
      isLoading={createTaskMutation.isPending}
      error={error}
      onCancel={() => router.back()}
    />
  );
}
