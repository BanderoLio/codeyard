'use client';

import { CodeyardIcon } from '../components/codeyard-icon';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/auth.api';
import { useRouter } from 'next/navigation';

export function Navbar({ titleFont }: { titleFont: string }) {
  const user = useAppStoreApi().use.user();
  const authorization = useAppStoreApi().use.authorization();
  const setAuthorization = useAppStoreApi().use.setAuthorization();
  const setUser = useAppStoreApi().use.setUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.push('/');
    },
    onError: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.push('/');
    },
  });

  return (
    <nav className="grid w-full grid-cols-3 items-center justify-items-center px-4 py-2">
      <div></div>
      <Link href="/" className="flex flex-row items-center justify-center">
        <CodeyardIcon width={64} height={64} />
        <h1 className={`text-4xl font-bold ${titleFont}`}>
          <span className="text-primary">Code</span>yard
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        {authorization && user ? (
          <>
            <span className="text-sm">{user.username}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
