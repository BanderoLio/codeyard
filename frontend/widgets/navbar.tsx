'use client';

import { CodeyardIcon } from '../components/codeyard-icon';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/auth.api';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { LOCALES } from '@/i18n';

export function Navbar({ titleFont }: { titleFont: string }) {
  const user = useAppStoreApi().use.user();
  const authorization = useAppStoreApi().use.authorization();
  const setAuthorization = useAppStoreApi().use.setAuthorization();
  const setUser = useAppStoreApi().use.setUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Navbar');

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.replace('/', { locale });
    },
    onError: () => {
      setAuthorization(null);
      setUser(null);
      queryClient.clear();
      router.replace('/', { locale });
    },
  });

  const handleLocaleChange = (targetLocale: string) => {
    if (targetLocale === locale) return;
    const basePath =
      pathname && LOCALES.some((loc) => pathname.startsWith(`/${loc}`))
        ? pathname.replace(/^\/(en|ru)(?=\/|$)/, '') || '/'
        : pathname || '/';

    router.replace(basePath, { locale: targetLocale });
  };

  return (
    <nav
      className="grid w-full grid-cols-3 items-center justify-items-center gap-2 px-2 py-2 sm:px-4"
      aria-label="Main navigation"
    >
      <div className="flex min-w-0 items-center justify-start"></div>
      <Link
        href="/"
        className="flex min-w-0 flex-row items-center justify-center gap-1 sm:gap-2"
        aria-label={t('homeAria')}
      >
        <CodeyardIcon
          width={40}
          height={40}
          className="h-8 w-8 shrink-0 sm:h-12 sm:w-12 md:h-16 md:w-16"
          aria-hidden="true"
        />
        <h1
          className={`text-lg font-bold sm:text-2xl md:text-4xl ${titleFont} truncate`}
        >
          <span className="text-primary">Code</span>yard
        </h1>
      </Link>
      <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2">
        <div className="flex items-center gap-1 rounded-full border px-1 py-0.5 text-xs">
          {LOCALES.map((itemLocale: string) => (
            <Button
              key={itemLocale}
              size="sm"
              variant={locale === itemLocale ? 'secondary' : 'ghost'}
              className="h-7 px-2"
              onClick={() => handleLocaleChange(itemLocale)}
              aria-pressed={locale === itemLocale}
            >
              {itemLocale.toUpperCase()}
            </Button>
          ))}
        </div>
        <ThemeToggle />
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
              onClick={() => logoutMutation.mutate()}
              aria-label={t('logout')}
              disabled={logoutMutation.isPending}
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
