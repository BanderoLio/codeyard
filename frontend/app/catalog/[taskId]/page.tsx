import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

type PageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetail({ params }: PageProps) {
  const { taskId } = await params;
  redirect(`/${defaultLocale}/catalog/${taskId}`);
}
