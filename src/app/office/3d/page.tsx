'use client';

import dynamic from 'next/dynamic';

const Office3DView = dynamic(
  () => import('@/components/office-3d/Office3DView').then(mod => ({ default: mod.Office3DView })),
  { ssr: false }
);

export default function Office3DPage() {
  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <Office3DView />
    </div>
  );
}
