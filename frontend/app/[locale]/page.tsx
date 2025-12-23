import { HomePage } from '@/views/index.page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: PageProps) {
  await params;
  return <HomePage />;
}
