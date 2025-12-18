import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CodeyardIcon } from '@/components/codeyard-icon';

export function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <CodeyardIcon width={128} height={128} className="mb-8" />
        <h1 className="mb-4 text-4xl font-bold">
          Welcome to <span className="text-primary">Codeyard</span>
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl text-lg">
          Store your code solutions with enjoy. A personal catalog of
          programming tasks with solutions, explanations, and links to sources.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/catalog">Browse Catalog</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
