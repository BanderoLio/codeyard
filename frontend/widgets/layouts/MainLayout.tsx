import { Navbar } from '@/widgets/navbar';
import type { ReactNode } from 'react';
import { pixelifySans } from '@/app/(fonts)/fonts';
import { Footer } from '../footer';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Navbar titleFont={pixelifySans.className} />
      {children}
      <Footer />
    </div>
  );
}
