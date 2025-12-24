import { useState } from 'react';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';

export function useRequireAuth() {
  const authorization = useAppStoreApi().use.authorization();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = (callback: () => void) => {
    if (authorization) {
      callback();
    } else {
      setShowAuthModal(true);
    }
  };

  return {
    isAuthenticated: !!authorization,
    showAuthModal,
    setShowAuthModal,
    requireAuth,
  };
}
