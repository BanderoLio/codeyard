'use client';

import { UseFormReturn } from 'react-hook-form';
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
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { useTranslations } from 'next-intl';
import type { TCategory, TDifficulty } from '../types';

type TTaskFormData = {
  name: string;
  description: string;
  resource?: string;
  category: number;
  difficulty: number;
};

type TCreateTaskPresentationProps = {
  form: UseFormReturn<TTaskFormData>;
  onSubmit: (data: TTaskFormData) => void;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
};

export function CreateTaskPresentation({
  form,
  onSubmit,
  categories,
  difficulties,
  isLoading,
  error,
  onCancel,
}: TCreateTaskPresentationProps) {
  const t = useTranslations('CreateTask');
  const tBreadcrumbs = useTranslations('Breadcrumbs');

  return (
    <div className="container mx-auto max-w-2xl px-4 py-4 sm:py-8">
      <Breadcrumbs
        items={[
          { label: tBreadcrumbs('home'), href: '/' },
          { label: tBreadcrumbs('catalog'), href: '/catalog' },
          { label: t('createTask') },
        ]}
        className="mb-4"
      />

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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categoryLabel')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
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
                          <SelectValue
                            placeholder={t('difficultyPlaceholder')}
                          />
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
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? t('creating') : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
