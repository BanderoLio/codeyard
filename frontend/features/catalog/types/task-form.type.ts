import { z } from 'zod';

export function createTaskSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('nameRequired')).max(255),
    description: z.string().min(1, t('descriptionRequired')),
    resource: z.url(t('invalidUrl')).optional().or(z.literal('')),
    category: z.number(t('categoryRequired')).min(1, t('categoryRequired')),
    difficulty: z
      .number(t('difficultyRequired'))
      .min(1, t('difficultyRequired')),
  });
}

export type TTaskFormData = z.infer<ReturnType<typeof createTaskSchema>>;
