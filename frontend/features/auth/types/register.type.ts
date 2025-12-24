import { z } from 'zod';

export function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(1, t('usernameRequired'))
      .min(3, t('usernameMin'))
      .max(50, t('usernameMax')),
    email: z.email(t('emailInvalid')).min(1, t('emailRequired')),
    password: z
      .string()
      .min(1, t('passwordRequired'))
      .min(5, t('passwordMin'))
      .max(255, t('passwordMax')),
  });
}

export type TRegister = z.infer<ReturnType<typeof createRegisterSchema>>;
