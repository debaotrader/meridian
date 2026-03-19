import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Sidebar } from '@/components/shared/Sidebar';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Meridian',
  description: 'Unified AI Agent Dashboard',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="font-sans bg-surface-0 text-text-primary min-h-screen flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
