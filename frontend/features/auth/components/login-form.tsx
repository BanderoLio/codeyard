'use client';

import { FormItem } from '@/components/form-item';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../auth.api';
import { loginSchema, TLogin } from '../types/login.type';
import { WithRedirect } from './with-redirect';
import { LogInIcon } from 'lucide-react';
import { IconButton } from '@/components/icon-button';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('Auth');
  const form = useForm<TLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeApi = useAppStoreApi();
  const setAuthorization = storeApi.use.setAuthorization();
  const setUser = storeApi.use.setUser();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      setAuthorization(data);
      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
      queryClient.clear();
      toast.success(t('loginSuccess'));
      router.replace('/catalog');
    },
    onError: (err: Error) => {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: TLogin) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <WithRedirect to="/catalog">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem label={t('usernameLabel')}>
                <Input placeholder={t('usernamePlaceholder')} {...field} />
              </FormItem>
            )}
            name="username"
          />
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem label={t('passwordLabel')}>
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...field}
                />
              </FormItem>
            )}
            name="password"
          />
          {error && (
            <div className="text-destructive text-center text-sm">{error}</div>
          )}
          <IconButton
            className="mt-2"
            type="submit"
            disabled={loginMutation.isPending}
            label={t('login')}
          >
            {loginMutation.isPending ? <Spinner /> : <LogInIcon />}
          </IconButton>
        </form>
      </Form>
    </WithRedirect>
  );
}
