import { RegisterPage } from '@/views/auth/register.page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Register({ params }: PageProps) {
  await params;
  return <RegisterPage />;
}
