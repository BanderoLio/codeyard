'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';

type TAuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthModal({ open, onOpenChange }: TAuthModalProps) {
  const t = useTranslations('Auth');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const authorization = useAppStoreApi().use.authorization();

  useEffect(() => {
    if (authorization && open) {
      onOpenChange(false);
    }
  }, [authorization, open, onOpenChange]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to avoid setState in effect
      const timer = setTimeout(() => setActiveTab('login'), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-center text-2xl font-semibold">
            {t('loginRequired')}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t('loginRequiredDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 border-b pb-0">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('login')}
            className={cn(
              'flex-1 rounded-b-none border-b-2 border-transparent transition-colors',
              activeTab === 'login' &&
                'border-primary text-primary bg-primary/5',
            )}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t('login')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('register')}
            className={cn(
              'flex-1 rounded-b-none border-b-2 border-transparent transition-colors',
              activeTab === 'register' &&
                'border-primary text-primary bg-primary/5',
            )}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t('signup')}
          </Button>
        </div>

        <div className="pt-6">
          {activeTab === 'login' ? (
            <LoginForm onSuccess={() => onOpenChange(false)} />
          ) : (
            <RegisterForm onSuccess={() => onOpenChange(false)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
