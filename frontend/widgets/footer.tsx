'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations('Footer');

  return (
    <div className="text-muted-foreground mx-auto py-2">
      {t('rights', { year })}
    </div>
  );
}
