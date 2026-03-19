'use client';
import { useEffect } from 'react';
import { useGateway } from '@/lib/gateway/use-gateway';
import { useVisualOfficeStore } from '@/lib/store/visual-office-store';
import { FloorPlan } from './FloorPlan';

export function OfficeView() {
  const { subscribe } = useGateway();
  const store = useVisualOfficeStore;

  useEffect(() => {
    // Subscribe to all gateway events and forward to visual office store
    const unsubscribe = subscribe('*', (event) => {
      // Events could carry agent updates; handle basic lifecycle events
      const payload = event.payload as Record<string, unknown> | null | undefined;
      if (!payload) return;
      // This is a placeholder — real integration would parse event types
    });
    return unsubscribe;
  }, [subscribe]);

  return (
    <div className="relative flex-1 h-full">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
          Office — 2D View
        </span>
      </div>
      <FloorPlan />
    </div>
  );
}
