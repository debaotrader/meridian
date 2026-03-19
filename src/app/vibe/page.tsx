'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicVibeModule = dynamic(
  () => import('@/components/vibe/VibeView'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-surface-0">
        <div className="text-center space-y-3">
          <div className="animate-pulse w-16 h-16 mx-auto rounded-lg bg-surface-1" />
          <p className="text-text-secondary text-sm">Loading Vibe Zone...</p>
        </div>
      </div>
    ),
  }
);

export default function VibePage() {
  return (
    <Suspense>
      <DynamicVibeModule />
    </Suspense>
  );
}
