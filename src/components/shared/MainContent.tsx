'use client';

import { useSidebar } from '@/lib/sidebar-context';
import { clsx } from 'clsx';

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      id="main-content"
      className={clsx(
        'min-h-screen transition-all duration-200',
        collapsed ? 'lg:pl-15' : 'lg:pl-64'
      )}
    >
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        {children}
      </div>
    </main>
  );
}
