'use client';

import { CodeyardIcon } from '@/components/codeyard-icon';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { SettingsMenu } from '@/components/settings-menu';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import type { TAuthorization } from '@/features/auth/types/authorization.type';
import type { TUser } from '@/features/auth/types/user.type';

type TNavbarPresentationProps = {
  titleFont: string;
  user: TUser | null;
  authorization: TAuthorization | null;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function NavbarPresentation({
  titleFont,
  user,
  authorization,
  onLogout,
  isLoggingOut,
}: TNavbarPresentationProps) {
  const t = useTranslations('Navbar');

  return (
    <nav
      className="relative flex w-full items-center gap-2 px-4 py-4 sm:px-6"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={cn(
          'flex min-w-0 flex-row items-center gap-1 sm:gap-2',
          'sm:absolute sm:left-1/2 sm:-translate-x-1/2',
        )}
        aria-label={t('homeAria')}
      >
        <CodeyardIcon
          width={40}
          height={40}
          className="h-7 w-7 shrink-0 sm:h-10 sm:w-10 md:h-12 md:w-12"
          aria-hidden="true"
        />
        <h1
          className={cn(
            'text-base font-bold sm:text-xl md:text-2xl lg:text-3xl',
            titleFont,
          )}
        >
          <span className="text-primary">Code</span>yard
        </h1>
      </Link>

      <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2">
        <SettingsMenu />
        {authorization && user ? (
          <>
            <span
              className="hidden max-w-[80px] truncate text-xs sm:inline md:max-w-[120px] md:text-sm lg:max-w-none"
              aria-label={t('loggedInAs', { username: user.username })}
              title={user.username}
            >
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label={t('logout')}
              disabled={isLoggingOut}
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 shrink-0 px-2 text-xs sm:px-3 sm:text-sm"
            >
              <Link href="/auth/login">
                <span className="hidden sm:inline">{t('login')}</span>
                <span className="sm:hidden">{t('loginShort')}</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-8 shrink-0 px-2 text-xs sm:px-3 sm:text-sm"
            >
              <Link href="/auth/register">
                <span className="hidden sm:inline">{t('signup')}</span>
                <span className="sm:hidden">{t('signupShort')}</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
