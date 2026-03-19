import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Sidebar } from '@/components/shared/Sidebar';
import { MainContent } from '@/components/shared/MainContent';
import { ClientProviders } from '@/components/shared/ClientProviders';
import { SidebarProvider } from '@/lib/sidebar-context';

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
    icon: '/meridian/favicon.svg',
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
          <SidebarProvider>
            {/* Skip to main content — accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-text-inverse focus:rounded-lg focus:text-sm focus:font-medium"
            >
              Pular para conteúdo principal
            </a>
            <Sidebar />
            <MainContent>{children}</MainContent>
          </SidebarProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
