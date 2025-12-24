'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { CodeyardIcon } from '@/components/codeyard-icon';
import { Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations('Footer');

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label={t('home')}
            >
              <CodeyardIcon
                width={32}
                height={32}
                className="h-8 w-8"
                aria-hidden="true"
              />
              <span className="text-lg font-bold">
                <span className="text-primary">Code</span>yard
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('navigation')}</h3>
            <nav
              className="flex flex-col space-y-2"
              aria-label="Footer navigation"
            >
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                href="/catalog"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('catalog')}
              </Link>
              <Link
                href="/catalog/create-task"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('createTask')}
              </Link>
            </nav>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('resources')}</h3>
            <nav
              className="flex flex-col space-y-2"
              aria-label="Footer resources"
            >
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('about')}
              </Link>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('documentation')}
              </Link>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('api')}
              </Link>
            </nav>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <nav className="flex flex-col space-y-2" aria-label="Footer legal">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('terms')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            {t('rights', { year })}
          </p>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            {t('madeWith')}{' '}
            <Heart
              className="h-4 w-4 fill-red-500 text-red-500"
              aria-hidden="true"
            />{' '}
            {t('forDevelopers')}
          </p>
        </div>
      </div>
    </footer>
  );
}
