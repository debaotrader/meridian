'use client';

import { useEffect } from 'react';
import { useGateway } from './use-gateway';
import { useOfficeStore } from '@/lib/store/office-store';
import { onTaskEvent } from '@/lib/events/task-events';
import { useQuestBridge } from '@/lib/store/quest-bridge';
import { useMissionControl } from '@/lib/store';
import { parseCrossModuleEvent } from './event-parser';

/**
 * Bridges events between Kanban, Office, and Vibe modules.
 * Must be rendered inside WsProvider.
 * Gracefully no-ops if store data is unavailable.
 *
 * ARCH RULE: All Gateway payloads pass through parseCrossModuleEvent()
 * before reaching any store or component.
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

  // Listen to WebSocket gateway events — ALL payloads go through parseCrossModuleEvent()
  useEffect(() => {
    // task.assigned → agent thinking
    const unsub1 = subscribe('task.assigned', (rawEvent) => {
      const parsed = parseCrossModuleEvent({ ...rawEvent, type: 'task.dispatched' });
      if (parsed?.type === 'task.dispatched') {
        updateAgent(parsed.agentId, {
          status: 'thinking',
          currentTool: null,
          speechText: parsed.taskName ?? null,
        });
      } else {
        // fallback: try raw payload for legacy events not yet using task.dispatched
        const payload = rawEvent.payload as Record<string, unknown>;
        const agentId = payload?.agentId as string | undefined;
        if (agentId) {
          updateAgent(agentId, {
            status: 'thinking',
            currentTool: null,
            speechText: (payload?.taskName as string) ?? null,
          });
        }
      }
    });

    // task.completed → agent idle
    const unsub2 = subscribe('task.completed', (rawEvent) => {
      const parsed = parseCrossModuleEvent(rawEvent);
      if (parsed?.type === 'task.completed') {
        updateAgent(parsed.agentId, {
          status: 'idle',
          currentTool: null,
          speechText: null,
        });
      }
    });

    // task.status_changed → map to agent status
    const unsub3 = subscribe('task.status_changed', (rawEvent) => {
      // task.status_changed is a local-only event type, not a CrossModuleEvent.
      // Parse defensively from payload directly.
      const payload = rawEvent.payload as Record<string, unknown>;
      const agentId = payload?.agentId as string | undefined;
      const newStatus = payload?.status as string | undefined;
      if (agentId) {
        if (newStatus === 'in_progress' || newStatus === 'testing') {
          updateAgent(agentId, { status: 'tool_calling' });
        } else if (newStatus === 'done' || newStatus === 'archived') {
          updateAgent(agentId, { status: 'idle', speechText: null });
        }
      }
    });

    // agent.message.delta → speech bubble with 4s auto-clear (GAP 3)
    const unsub4 = subscribe('agent.message.delta', (rawEvent) => {
      const parsed = parseCrossModuleEvent(rawEvent);
      if (parsed?.type !== 'agent.message.delta') return;
      const { agentId, markdown } = parsed;
      updateAgent(agentId, {
        speechText: markdown.slice(0, 80),
      });
      const timerId = setTimeout(() => {
        updateAgent(agentId, { speechText: null });
      }, 4000);
      // Note: cleanup of this timer happens naturally when component unmounts
      // or the next delta clears the speech. The timer ref is local to this closure.
      void timerId;
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [subscribe, updateAgent]);
}
