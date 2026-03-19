'use client';

import { useSearchParams } from 'next/navigation';
import { KanbanView } from './KanbanView';

/**
 * Client component that reads ?task= and ?agent= query params
 * and passes them down to KanbanView for highlight/scroll behavior.
 */
export function KanbanPageClient() {
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get('task') ?? undefined;
  const highlightAgentId = searchParams.get('agent') ?? undefined;
  const shouldHighlight = searchParams.get('highlight') === 'true';

  return (
    <KanbanView
      highlightTaskId={shouldHighlight ? highlightTaskId : undefined}
      highlightAgentId={highlightAgentId}
    />
  );
}
