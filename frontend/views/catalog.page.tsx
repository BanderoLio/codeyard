import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { CatalogContainer } from '@/features/catalog/components/catalog-container';
import { useTranslations } from 'next-intl';

export function CatalogPage() {
  const t = useTranslations('Catalog');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <Breadcrumbs
        items={[{ label: t('home'), href: '/' }, { label: t('catalog') }]}
        className="mb-4"
      />
      <CatalogContainer />
    </div>
  );
}
