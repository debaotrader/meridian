// Meridian office store — Zustand + Immer
// Tracks agent status fed by Gateway events

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { GatewayEvent } from '@/lib/gateway/types';

enableMapSet();

export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'tool_calling'
  | 'speaking'
  | 'error';

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  lastActiveAt: number;
  currentTool: string | null;
  speechText: string | null;
  toolCallCount: number;
}

interface OfficeStoreState {
  agents: Map<string, AgentState>;
  lastEventTs: number;
}

interface OfficeStoreActions {
  updateAgentStatus: (
    agentId: string,
    patch: Partial<Omit<AgentState, 'id'>>,
  ) => void;
  feedEvent: (event: GatewayEvent) => void;
  upsertAgent: (agent: Pick<AgentState, 'id' | 'name'>) => void;
  removeAgent: (agentId: string) => void;
}

export type OfficeStore = OfficeStoreState & OfficeStoreActions;

function resolveAgentIdFromEvent(event: GatewayEvent): string | null {
  const payload = event.payload as Record<string, unknown> | null;
  if (!payload) return null;
  return (
    (payload.agentId as string) ??
    (payload.runId as string) ??
    null
  );
}

function parseStatusFromEvent(event: GatewayEvent): Partial<Omit<AgentState, 'id'>> | null {
  const payload = event.payload as Record<string, unknown>;
  const stream = (payload.stream as string) ?? event.type;
  const data = (payload.data as Record<string, unknown>) ?? {};

  switch (stream) {
    case 'lifecycle': {
      const phase = data.phase as string;
      if (phase === 'start' || phase === 'thinking') {
        return { status: 'thinking', currentTool: null };
      }
      if (phase === 'end') {
        return { status: 'idle', currentTool: null, speechText: null };
      }
      if (phase === 'fallback') {
        return { status: 'error' };
      }
      return { status: 'thinking' };
    }
    case 'tool': {
      const phase = data.phase as string;
      const name = (data.name as string) ?? 'unknown';
      if (phase === 'start') {
        return {
          status: 'tool_calling',
          currentTool: name,
          toolCallCount: undefined, // incremented below
        };
      }
      return { status: 'thinking', currentTool: null };
    }
    case 'assistant': {
      const text = (data.text as string) ?? '';
      return { status: 'speaking', speechText: text };
    }
    case 'error': {
      return { status: 'error' };
    }
    default:
      return null;
  }
}

export const useOfficeStore = create<OfficeStore>()(
  immer((set) => ({
    agents: new Map<string, AgentState>(),
    lastEventTs: 0,

    upsertAgent: (agent) => {
      set((state) => {
        if (!state.agents.has(agent.id)) {
          state.agents.set(agent.id, {
            id: agent.id,
            name: agent.name,
            status: 'idle',
            lastActiveAt: Date.now(),
            currentTool: null,
            speechText: null,
            toolCallCount: 0,
          });
        }
      });
    },

    removeAgent: (agentId) => {
      set((state) => {
        state.agents.delete(agentId);
      });
    },

    updateAgentStatus: (agentId, patch) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return;
        Object.assign(agent, patch);
        agent.lastActiveAt = Date.now();
      });
    },

    feedEvent: (event: GatewayEvent) => {
      set((state) => {
        state.lastEventTs = event.ts;

        const agentId = resolveAgentIdFromEvent(event);
        if (!agentId) return;

        // Ensure agent exists
        if (!state.agents.has(agentId)) {
          state.agents.set(agentId, {
            id: agentId,
            name: agentId,
            status: 'idle',
            lastActiveAt: Date.now(),
            currentTool: null,
            speechText: null,
            toolCallCount: 0,
          });
        }

        const patch = parseStatusFromEvent(event);
        if (!patch) return;

        const agent = state.agents.get(agentId)!;
        const isToolStart =
          ((event.payload as Record<string, unknown>)?.stream === 'tool' ||
            event.type === 'tool') &&
          ((event.payload as Record<string, unknown>)?.data as Record<string, unknown> | undefined)
            ?.phase === 'start';

        Object.assign(agent, patch);
        if (isToolStart) {
          agent.toolCallCount = (agent.toolCallCount ?? 0) + 1;
        }
        agent.lastActiveAt = event.ts;
      });
    },
  })),
);

// Standalone feedEvent for imperative use outside React
export function feedEvent(event: GatewayEvent): void {
  useOfficeStore.getState().feedEvent(event);
}
