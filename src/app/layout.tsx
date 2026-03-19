import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Sidebar } from '@/components/shared/Sidebar';
import { ClientProviders } from '@/components/shared/ClientProviders';

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
  description: 'Painel unificado de gestão de agentes de IA',
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
    <html lang="pt-BR" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans bg-surface-0 text-text-primary">
        <ClientProviders>
          <Sidebar />
          {/* Main content — offset by sidebar (256px desktop, 0 mobile) */}
          <main className="lg:pl-64 min-h-screen">
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
