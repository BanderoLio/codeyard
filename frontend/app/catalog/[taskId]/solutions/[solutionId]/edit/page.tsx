import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

type PageProps = {
  params: Promise<{ taskId: string; solutionId: string }>;
};

export default async function EditSolution({ params }: PageProps) {
  const { taskId, solutionId } = await params;
  redirect(`/${defaultLocale}/catalog/${taskId}/solutions/${solutionId}/edit`);
}
