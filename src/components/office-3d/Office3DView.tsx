'use client';
import { useEffect } from 'react';
import { useGateway } from '@/lib/gateway/use-gateway';
import { DynamicOffice3D } from './DynamicOffice3D';

export function Office3DView() {
  const { subscribe } = useGateway();

  useEffect(() => {
    const unsubscribe = subscribe('*', (_event) => {
      // Forward gateway events to visual store as needed
    });
    return unsubscribe;
  }, [subscribe]);

  return (
    <div className="relative flex-1 h-full">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
          Office — 3D View
        </span>
      </div>
      <div className="w-full h-full min-h-screen">
        <DynamicOffice3D />
      </div>
    </div>
  );
}
