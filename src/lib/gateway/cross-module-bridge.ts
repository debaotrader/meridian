'use client';

import { useEffect } from 'react';
import { useGateway } from './use-gateway';
import { useOfficeStore } from '@/lib/store/office-store';
import { onTaskEvent } from '@/lib/events/task-events';
import { useQuestBridge } from '@/lib/store/quest-bridge';
import { useMissionControl } from '@/lib/store';

/**
 * Bridges events between Kanban, Office, and Vibe modules.
 * Must be rendered inside WsProvider.
 * Gracefully no-ops if store data is unavailable.
 */
export function useCrossModuleBridge() {
  const { subscribe } = useGateway();
  const updateAgent = useOfficeStore((s) => s.updateAgentStatus);
  const syncFromTasks = useQuestBridge((s) => s.syncFromTasks);
  const { tasks, agents } = useMissionControl();

  // Sync quest bridge whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      syncFromTasks(tasks, agents);
    }
  }, [tasks, agents, syncFromTasks]);

  // Listen to local event bus (from drag-and-drop in kanban)
  useEffect(() => {
    const unsub = onTaskEvent((event) => {
      const agentId = event.agentId;
      if (!agentId) return;

      if (event.type === 'task.status_changed') {
        if (event.status === 'in_progress' || event.status === 'assigned') {
          updateAgent(agentId, {
            status: 'thinking',
            speechText: event.taskName ?? null,
          });
        } else if (event.status === 'done') {
          updateAgent(agentId, { status: 'idle', speechText: null });
        } else if (event.status === 'testing' || event.status === 'review') {
          updateAgent(agentId, { status: 'tool_calling' });
        }
      } else if (event.type === 'task.assigned') {
        updateAgent(agentId, {
          status: 'thinking',
          currentTool: null,
          speechText: event.taskName ?? null,
        });
      } else if (event.type === 'task.completed') {
        updateAgent(agentId, {
          status: 'idle',
          currentTool: null,
          speechText: null,
        });
      }
    });
    return unsub;
  }, [updateAgent]);

  // Listen to WebSocket gateway events (if connected)
  useEffect(() => {
    // When task is assigned to an agent
    const unsub1 = subscribe('task.assigned', (event) => {
      const payload = event.payload as Record<string, unknown>;
      const agentId = payload?.agentId as string;
      if (agentId) {
        updateAgent(agentId, {
          status: 'thinking',
          currentTool: null,
          speechText: (payload?.taskName as string) ?? null,
        });
      }
    });

    // When task is completed
    const unsub2 = subscribe('task.completed', (event) => {
      const payload = event.payload as Record<string, unknown>;
      const agentId = payload?.agentId as string;
      if (agentId) {
        updateAgent(agentId, {
          status: 'idle',
          currentTool: null,
          speechText: null,
        });
      }
    });

    // When task status changes (drag-and-drop)
    const unsub3 = subscribe('task.status_changed', (event) => {
      const payload = event.payload as Record<string, unknown>;
      const agentId = payload?.agentId as string;
      const newStatus = payload?.status as string;
      if (agentId) {
        if (newStatus === 'in_progress' || newStatus === 'testing') {
          updateAgent(agentId, { status: 'tool_calling' });
        } else if (newStatus === 'done' || newStatus === 'archived') {
          updateAgent(agentId, { status: 'idle', speechText: null });
        }
      }
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [subscribe, updateAgent]);
}
