import type { Metadata } from 'next';
import { Geist, Geist_Mono, Pixelify_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/shared/providers/theme.provider';
import { QueryProvider } from '@/shared/providers/query.provider';
import { ZustandProvider } from '@/shared/providers/zustand.provider';
import { MainLayout } from '../widgets/layouts/MainLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const pixelifySans = Pixelify_Sans({
  variable: '--font-pixelify-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Codeyard',
  description: 'Coding solutions for your problems',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ZustandProvider>
          <QueryProvider>
            <ThemeProvider>
              <MainLayout>{children}</MainLayout>
            </ThemeProvider>
          </QueryProvider>
        </ZustandProvider>
      </body>
    </html>
  );
}
