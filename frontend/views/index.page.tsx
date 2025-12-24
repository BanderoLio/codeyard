'use client';

import { useEffect } from 'react';
import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { CodeyardIcon } from '@/components/codeyard-icon';
import { cn } from '@/lib/utils';
import { pixelifySans } from '@/app/(fonts)/fonts';
import { ArrowRight, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useAppStoreApi } from '@/shared/providers/zustand.provider';

const sampleSnippet = `def solve(tasks):
    completed = []
    for task in tasks:
        if task.is_ready():
            completed.append(task.run())
    return completed

print("Codeyard keeps solutions tidy!")`;

export function HomePage() {
  const t = useTranslations('Home');
  const router = useRouter();
  const authorization = useAppStoreApi().use.authorization();

  useEffect(() => {
    if (authorization) {
      router.replace('/catalog');
    }
  }, [authorization, router]);

  const stats = [
    { value: '2.7k+', label: t('statSolutions') },
    { value: '4.8/5', label: t('statQuality') },
    { value: '12', label: t('statLanguages') },
  ];

  const features = [
    {
      icon: Sparkles,
      title: t('featureCurationTitle'),
      desc: t('featureCurationDesc'),
    },
    {
      icon: ShieldCheck,
      title: t('featureHighlightingTitle'),
      desc: t('featureHighlightingDesc'),
    },
    {
      icon: Wand2,
      title: t('featureCollaborationTitle'),
      desc: t('featureCollaborationDesc'),
    },
  ];

  return (
    <div className="from-background via-background to-muted/40 relative overflow-hidden bg-linear-to-b">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/10 absolute top-10 left-10 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -right-16 -bottom-24 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="bg-primary/15 text-primary inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                ●
              </span>
              <span>{t('badge')}</span>
            </div>

            <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
              {t('eyebrow')}
            </p>

            <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
              <span className="block">{t('titleLead')}</span>
              <span
                className={cn(
                  'text-primary mt-1 block text-5xl sm:text-6xl',
                  pixelifySans.className,
                )}
              >
                {t('titleAccent')}
              </span>
              <span className="text-foreground block">{t('titleTail')}</span>
            </h1>

            <p className="text-muted-foreground max-w-2xl text-lg">
              {t('subtitle')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/catalog">
                  {t('primaryCta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/auth/login">{t('secondaryCta')}</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/catalog">{t('tertiaryCta')}</Link>
              </Button>
            </div>

            <div className="bg-card/80 grid gap-4 rounded-xl border p-4 shadow-sm sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/80 relative overflow-hidden rounded-2xl border p-4 shadow-lg">
            <div className="from-primary/10 absolute inset-x-0 top-0 h-24 bg-linear-to-b to-transparent" />
            <div className="relative flex items-center justify-between pb-4">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  {t('metricsTitle')}
                </p>
                <p className="text-lg font-semibold">{t('codeTitle')}</p>
                <p className="text-muted-foreground text-sm">
                  {t('codeSubtitle')}
                </p>
              </div>
              <CodeyardIcon
                width={52}
                height={52}
                className="h-12 w-12"
                aria-hidden="true"
              />
            </div>
            <div className="bg-background/70 rounded-xl border p-2 shadow-inner">
              <CodeBlock
                code={sampleSnippet}
                language="python"
                showCopyButton={false}
              />
            </div>
          </div>
        </section>

        <section className="mt-14 space-y-6">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
              {t('featureTitle')}
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              {t('featureSubtitle')}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card hover:border-primary/50 group rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-primary/10 text-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="group-hover:text-primary text-lg font-semibold transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
