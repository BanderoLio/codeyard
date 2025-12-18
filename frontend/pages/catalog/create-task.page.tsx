'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { catalogApi } from '@/features/catalog/catalog.api';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormItem as CustomFormItem } from '@/components/form-item';
import Link from 'next/link';
import { useAuth } from '@/features/auth/use-auth';
import { getErrorMessage } from '@/lib/utils/error-handler';

const taskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  resource: z.url('Invalid URL').optional().or(z.literal('')),
  category: z.number().min(1, 'Category is required'),
  difficulty: z.number().min(1, 'Difficulty is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function CreateTaskPage() {
  useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      resource: '',
      category: undefined,
      difficulty: undefined,
    },
  });

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: catalogApi.createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const taskId = data?.id;
      if (taskId !== undefined && taskId !== null) {
        const id = Number(taskId);
        if (!isNaN(id) && id > 0) {
          router.push(`/catalog/${id}`);
          return;
        }
      }
      setError('Failed to create task. Invalid response from server.');
    },
    onError: (error: Error) => {
      setError(getErrorMessage(error));
    },
  });

  const onSubmit = (data: TaskFormData) => {
    setError(null);
    createMutation.mutate({
      name: data.name,
      description: data.description,
      resource: data.resource || '',
      category: data.category,
      difficulty: data.difficulty,
    } as Parameters<typeof catalogApi.createTask>[0]);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/catalog">← Back to Catalog</Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Create New Task</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <CustomFormItem label="Task Name">
                  <Input placeholder="Enter task name" {...field} />
                </CustomFormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <CustomFormItem label="Description">
                  <Textarea
                    placeholder="Enter task description"
                    rows={6}
                    {...field}
                  />
                </CustomFormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <CustomFormItem label="Resource URL (optional)">
                  <Input
                    type="url"
                    placeholder="https://example.com/task"
                    {...field}
                  />
                </CustomFormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value: string) =>
                      field.onChange(Number(value))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value: string) =>
                      field.onChange(Number(value))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficulties?.map((diff) => (
                        <SelectItem key={diff.id} value={diff.id.toString()}>
                          {diff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
