import { z } from 'zod';

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(1, t('usernameRequired'))
      .min(3, t('usernameMin'))
      .max(50, t('usernameMax')),
    password: z
      .string()
      .min(1, t('passwordRequired'))
      .min(5, t('passwordMin'))
      .max(255, t('passwordMax')),
  });
}

export type TLogin = z.infer<ReturnType<typeof createLoginSchema>>;
