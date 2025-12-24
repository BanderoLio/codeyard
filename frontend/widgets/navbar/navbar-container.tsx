'use client';

import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { NavbarPresentation } from './navbar-presentation';

type TNavbarContainerProps = {
  titleFont: string;
};

export function NavbarContainer({ titleFont }: TNavbarContainerProps) {
  const user = useAppStoreApi().use.user();
  const authorization = useAppStoreApi().use.authorization();
  const logoutMutation = useLogout();

  return (
    <NavbarPresentation
      titleFont={titleFont}
      user={user}
      authorization={authorization}
      onLogout={() => logoutMutation.mutate()}
      isLoggingOut={logoutMutation.isPending}
    />
  );
}
