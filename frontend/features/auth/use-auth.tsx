import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { redirect, RedirectType } from 'next/navigation';

export function useAuth() {
  const auth = useAppStoreApi().use.authorization();
  if (!auth) {
    return redirect('/auth/login', RedirectType.replace);
  }
  return auth;
}
