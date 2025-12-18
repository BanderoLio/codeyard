'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../catalog.api';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import type { TCreateSolution, TUpdateSolution } from '../types';
import { getErrorMessage } from '@/lib/utils/error-handler';

const solutionSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.number().min(1, 'Language is required'),
  explanation: z.string().optional(),
});

type SolutionFormData = z.infer<typeof solutionSchema>;

type SolutionFormProps = {
  taskId: number;
  solutionId?: number;
  initialData?: Partial<TCreateSolution>;
  onSuccess: () => void;
  onCancel: () => void;
};

export function SolutionForm({
  taskId,
  solutionId,
  initialData,
  onSuccess,
  onCancel,
}: SolutionFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: languages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => catalogApi.getLanguages(),
  });

  const form = useForm<SolutionFormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      code: initialData?.code || '',
      language: initialData?.language || undefined,
      explanation: initialData?.explanation || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TCreateSolution) =>
      catalogApi.createSolution({ ...data, task: taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TUpdateSolution) =>
      catalogApi.updateSolution(solutionId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(getErrorMessage(error));
    },
  });

  const onSubmit = (data: SolutionFormData) => {
    setError(null);
    if (solutionId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({
        ...data,
        task: taskId,
        explanation: data.explanation ?? '',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">
        {solutionId ? 'Edit Solution' : 'Create Solution'}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Programming Language</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value: string) =>
                      field.onChange(Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id.toString()}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explanation (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain your solution approach..."
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solution Code</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your solution code"
                    {...field}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {solutionId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
