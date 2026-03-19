'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OfficeView } from '@/components/office-2d/OfficeView';
import { useVisualOfficeStore } from '@/lib/store/visual-office-store';

function OfficePageInner() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agent');
  const focus = searchParams.get('focus') === 'true';

  useEffect(() => {
    if (agentId && focus) {
      useVisualOfficeStore.getState().selectAgent(agentId);
    }
  }, [agentId, focus]);

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <OfficeView />
    </div>
  );
}

export default function OfficePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
        <OfficeView />
      </div>
    }>
      <OfficePageInner />
    </Suspense>
  );
}
