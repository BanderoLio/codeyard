import { Navbar } from '@/widgets/navbar';
import type { ReactNode } from 'react';
import { pixelifySans } from '../../app/layout';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Navbar titleFont={pixelifySans.className} />
      {children}
      <div className="text-muted-foreground mx-auto py-2">
        @ 2004 Kriper. ВСЕ ПРАВА ЗАЩЕЩЕНЫ
      </div>
    </div>
  );
}
