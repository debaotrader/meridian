'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useCrossModuleNav() {
  const router = useRouter();

  const goToAgentTask = useCallback(
    (agentId: string, taskId?: string) => {
      if (taskId) {
        router.push(`/kanban?task=${taskId}&highlight=true`);
      } else {
        router.push(`/kanban?agent=${agentId}`);
      }
    },
    [router],
  );

  const goToOfficeAgent = useCallback(
    (agentId: string) => {
      router.push(`/office?agent=${agentId}&focus=true`);
    },
    [router],
  );

  const goToVibeAgent = useCallback(
    (agentId: string) => {
      router.push(`/vibe?agent=${agentId}`);
    },
    [router],
  );

  return { goToAgentTask, goToOfficeAgent, goToVibeAgent };
}
