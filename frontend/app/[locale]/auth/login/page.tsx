import { LoginPage } from '@/views/auth/login.page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Login({ params }: PageProps) {
  await params;
  return <LoginPage />;
}
