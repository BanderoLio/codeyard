'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
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
import { Link } from '@/navigation';
import { useAuth } from '@/features/auth/use-auth';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslations } from 'next-intl';

const taskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  resource: z.url('Invalid URL').optional().or(z.literal('')),
  category: z.number().min(1, 'Category is required'),
  difficulty: z.number().min(1, 'Difficulty is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function CreateTaskPage() {
  const t = useTranslations('CreateTask');
  const tBreadcrumbs = useTranslations('Breadcrumbs');
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
      toast.success(t('createSuccess'));
      const taskId = data?.id;
      if (taskId !== undefined && taskId !== null) {
        const id = Number(taskId);
        if (!isNaN(id) && id > 0) {
          router.push(`/catalog/${id}`);
          return;
        }
      }
      const errorMessage =
        'Failed to create task. Invalid response from server.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
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
    <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{tBreadcrumbs('home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/catalog">{tBreadcrumbs('catalog')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('createTask')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-card rounded-lg border p-4 shadow-sm sm:p-6">
        <h1 className="mb-6 text-xl font-bold sm:text-2xl">{t('title')}</h1>

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
                <CustomFormItem label={t('nameLabel')}>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </CustomFormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <CustomFormItem label={t('descriptionLabel')}>
                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
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
                <CustomFormItem label={t('resourceLabel')}>
                  <Input
                    type="url"
                    placeholder={t('resourcePlaceholder')}
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
                  <FormLabel>{t('categoryLabel')}</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value: string) =>
                      field.onChange(Number(value))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('categoryPlaceholder')} />
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
                  <FormLabel>{t('difficultyLabel')}</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value: string) =>
                      field.onChange(Number(value))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('difficultyPlaceholder')} />
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

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
                disabled={createMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createMutation.isPending ? t('creating') : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
