import { CatalogPage } from '@/views/catalog.page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Catalog({ params }: PageProps) {
  await params;
  return <CatalogPage />;
}
