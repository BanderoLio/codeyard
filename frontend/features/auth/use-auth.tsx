'use client';

import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const storeApi = useAppStoreApi();
  const router = useRouter();
  const auth = storeApi.use.authorization();

  useEffect(() => {
    if (!auth) {
      router.replace('/auth/login');
    }
  }, [auth, router]);

  return auth;
}
