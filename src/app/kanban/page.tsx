import { Suspense } from 'react';
import { KanbanPageClient } from '@/components/kanban/KanbanPageClient';

export default function KanbanPage() {
  return (
    <div className="h-screen bg-surface-0">
      <Suspense fallback={<div className="h-screen bg-surface-0" />}>
        <KanbanPageClient />
      </Suspense>
    </div>
  );
}
