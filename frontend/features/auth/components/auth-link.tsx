'use client';

import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import type { LinkProps } from 'next/link';
import Link from 'next/link';
import { useState, type PropsWithChildren } from 'react';
import { AuthModal } from './auth-modal';
import { Slot } from '@radix-ui/react-slot';

export function AuthLink({
  children,
  asChild = false,
  ...props
}: PropsWithChildren<
  LinkProps & {
    asChild?: boolean;
  }
>) {
  const auth = useAppStoreApi().use.authorization();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };
  const Comp = asChild ? Slot : Link;
  if (!auth) {
    return (
      <>
        <Comp {...props} href="#" onClick={handleShowAuthModal}>
          {children}
        </Comp>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }
  return <Link {...props}>{children}</Link>;
}
