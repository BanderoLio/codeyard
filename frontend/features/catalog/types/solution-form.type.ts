import { z } from 'zod';

export function createSolutionSchema(t: (key: string) => string) {
  return z.object({
    code: z.string().min(1, t('codeRequired')),
    language: z.number(t('languageRequired')).min(1, t('languageRequired')),
    explanation: z.string().optional(),
  });
}

export type TSolutionFormData = z.infer<
  ReturnType<typeof createSolutionSchema>
>;
