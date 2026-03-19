'use client';
import dynamic from 'next/dynamic';

export const DynamicOffice3D = dynamic(
  () => import('./Scene3D'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-surface-0">
        <div className="animate-pulse w-full h-full min-h-[400px] bg-surface-1 rounded-lg" />
      </div>
    ),
  }
);
