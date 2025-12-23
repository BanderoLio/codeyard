'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from '@/features/auth';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const t = useTranslations('Auth');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('loginRequired')}</DialogTitle>
          <DialogDescription>{t('loginRequiredDesc')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <LoginForm />
        </div>
        <div className="text-muted-foreground text-center text-sm">
          {t('noAccount')}{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
