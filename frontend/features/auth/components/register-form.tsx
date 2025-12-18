'use client';

import { FormItem } from '@/components/form-item';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../auth.api';
import { registerSchema, TRegister } from '../types/register.type';
import { WithRedirect } from './with-redirect';
import { UserPlusIcon } from 'lucide-react';
import { IconButton } from '@/components/icon-button';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/utils/error-handler';

export function RegisterForm() {
  const form = useForm<TRegister>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });
  const router = useRouter();
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
      router.push('/catalog');
    },
    onError: (err: Error) => {
      setError(getErrorMessage(err));
    },
  });

  const onSubmit = (data: TRegister) => {
    setError(null);
    registerMutation.mutate(data);
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
              <FormItem label="Username">
                <Input placeholder="Enter your username" {...field} />
              </FormItem>
            )}
            name="username"
          />
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem label="Email">
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormItem>
            )}
            name="email"
          />
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem label="Password">
                <Input
                  type="password"
                  placeholder="Enter your password"
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
            label="Sign Up"
          >
            {registerMutation.isPending ? <Spinner /> : <UserPlusIcon />}
          </IconButton>
        </form>
      </Form>
    </WithRedirect>
  );
}
