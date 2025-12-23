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
import { useState, useMemo } from 'react';
import type { TCreateSolution, TUpdateSolution } from '../types';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { CodeEditor } from '@/components/code-editor';

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
    onMutate: async (newSolution) => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      const previousSolutions = queryClient.getQueryData([
        'solutions',
        taskId,
      ]);
      return { previousSolutions };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      toast.success('Solution created successfully');
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TUpdateSolution) =>
      catalogApi.updateSolution(solutionId!, data),
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries({ queryKey: ['solutions', taskId] });
      await queryClient.cancelQueries({ queryKey: ['solution', solutionId] });
      const previousSolutions = queryClient.getQueryData([
        'solutions',
        taskId,
      ]);
      const previousSolution = queryClient.getQueryData([
        'solution',
        solutionId,
      ]);
      queryClient.setQueryData(['solution', solutionId], (old: any) => {
        if (!old) return old;
        return { ...old, ...updatedData };
      });
      return { previousSolutions, previousSolution };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousSolution) {
        queryClient.setQueryData(
          ['solution', solutionId],
          context.previousSolution,
        );
      }
      if (context?.previousSolutions) {
        queryClient.setQueryData(
          ['solutions', taskId],
          context.previousSolutions,
        );
      }
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions', taskId] });
      queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
      toast.success('Solution updated successfully');
      onSuccess();
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
  const selectedLanguage = form.watch('language');
  const selectedLanguageName = useMemo(
    () => languages?.find((lang) => lang.id === selectedLanguage)?.name,
    [languages, selectedLanguage],
  );

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="border-b bg-muted/30 px-4 py-3 sm:px-6">
        <h3 className="text-base font-semibold sm:text-lg">
          {solutionId ? 'Edit Solution' : 'Create Solution'}
        </h3>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Write your solution code with syntax highlighting
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-destructive/10 text-destructive border-destructive/20 mb-6 rounded-md border p-3 text-sm">
                {error}
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Programming Language
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value: string) =>
                            field.onChange(Number(value))
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select programming language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages?.map((lang) => (
                              <SelectItem
                                key={lang.id}
                                value={lang.id.toString()}
                              >
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-muted-foreground text-xs">
                        Select the language for syntax highlighting and better
                        code editing experience.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Explanation{' '}
                        <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain your solution approach, time complexity, space complexity, or any other notes..."
                          {...field}
                          rows={8}
                          className="resize-y"
                        />
                      </FormControl>
                      <p className="text-muted-foreground text-xs">
                        Add any additional context about your solution.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="h-full flex flex-col">
                      <FormLabel className="text-base">Solution Code</FormLabel>
                      <FormControl>
                        <CodeEditor
                          value={field.value}
                          onChange={field.onChange}
                          language={selectedLanguageName}
                          placeholder="Enter your solution code here..."
                          minHeight="400px"
                          maxHeight="calc(100vh - 300px)"
                          className="border-input bg-background flex-1"
                        />
                      </FormControl>
                      <p className="text-muted-foreground text-xs">
                        Code editor with syntax highlighting. Select a language
                        for better support.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? solutionId
                  ? 'Updating...'
                  : 'Creating...'
                : solutionId
                  ? 'Update Solution'
                  : 'Create Solution'}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}
