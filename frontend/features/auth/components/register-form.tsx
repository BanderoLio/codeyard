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
import { createRegisterSchema, TRegister } from '../types/register.type';
import { UserPlusIcon } from 'lucide-react';
import { IconButton } from '@/components/icon-button';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type TRegisterFormProps = {
  onSuccess?: () => void;
};

export function RegisterForm({ onSuccess }: TRegisterFormProps = {}) {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const form = useForm<TRegister>({
    resolver: zodResolver(createRegisterSchema(tValidation)),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeApi = useAppStoreApi();
  const setAuthorization = storeApi.use.setAuthorization();
  const setUser = storeApi.use.setUser();
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      setAuthorization(data);
      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
      queryClient.clear();
      toast.success(t('signupSuccess'));
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace('/catalog');
      }
    },
    onError: (err: Error) => {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: TRegister) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
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
            <FormItem label={t('emailLabel')}>
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                {...field}
              />
            </FormItem>
          )}
          name="email"
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
          disabled={registerMutation.isPending}
          label={t('signup')}
        >
          {registerMutation.isPending ? <Spinner /> : <UserPlusIcon />}
        </IconButton>
      </form>
    </Form>
  );
}
