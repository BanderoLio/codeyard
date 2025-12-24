import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/navigation';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { authApi } from '../auth.api';

export function useLogout() {
  const setAuthorization = useAppStoreApi().use.setAuthorization();
  const setUser = useAppStoreApi().use.setUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.replace('/');
    },
    onError: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.replace('/');
    },
  });
}
