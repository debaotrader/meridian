// Visual Office Store — full shape expected by office-2d, office-3d, and panel components
// This is a separate store from the Meridian office-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type {
  VisualAgent,
  CollaborationLink,
  EventHistoryItem,
  GlobalMetrics,
  TokenSnapshot,
  ThemeMode,
  AgentZone,
} from '@/lib/office/types';
import {
  planWalkPath,
  calculateWalkDuration,
  interpolatePathPosition,
} from '@/lib/office/movement-animator';

enableMapSet();

interface VisualOfficeStoreState {
  agents: Map<string, VisualAgent>;
  links: CollaborationLink[];
  globalMetrics: GlobalMetrics;
  selectedAgentId: string | null;
  eventHistory: EventHistoryItem[];
  theme: ThemeMode;
  bloomEnabled: boolean;
  tokenHistory: TokenSnapshot[];
  agentCosts: Record<string, number>;
  maxSubAgents: number;
}

interface VisualOfficeStoreActions {
  selectAgent: (id: string | null) => void;
  setTheme: (theme: ThemeMode) => void;
  setBloomEnabled: (enabled: boolean) => void;
  upsertVisualAgent: (agent: VisualAgent) => void;
  removeVisualAgent: (id: string) => void;
  updateVisualAgent: (id: string, patch: Partial<VisualAgent>) => void;
  setLinks: (links: CollaborationLink[]) => void;
  pushTokenSnapshot: (snap: TokenSnapshot) => void;
  setAgentCosts: (costs: Record<string, number>) => void;
  updateMetrics: () => void;
  // Movement
  startMovement: (agentId: string, toZone: AgentZone, targetPos?: { x: number; y: number }) => void;
  tickMovement: (agentId: string, deltaTime: number) => void;
  completeMovement: (agentId: string) => void;
}

type VisualOfficeStore = VisualOfficeStoreState & VisualOfficeStoreActions;

export const useVisualOfficeStore = create<VisualOfficeStore>()(
  immer((set, get) => ({
    agents: new Map<string, VisualAgent>(),
    links: [],
    globalMetrics: {
      activeAgents: 0,
      totalAgents: 0,
      totalTokens: 0,
      tokenRate: 0,
      collaborationHeat: 0,
    },
    selectedAgentId: null,
    eventHistory: [],
    theme: 'dark' as ThemeMode,
    bloomEnabled: true,
    tokenHistory: [],
    agentCosts: {},
    maxSubAgents: 8,

    selectAgent: (id) =>
      set((s) => {
        s.selectedAgentId = id;
      }),

    setTheme: (theme) =>
      set((s) => {
        s.theme = theme;
      }),

    setBloomEnabled: (enabled) =>
      set((s) => {
        s.bloomEnabled = enabled;
      }),

    upsertVisualAgent: (agent) =>
      set((s) => {
        s.agents.set(agent.id, agent);
      }),

    removeVisualAgent: (id) =>
      set((s) => {
        s.agents.delete(id);
      }),

    updateVisualAgent: (id, patch) =>
      set((s) => {
        const agent = s.agents.get(id);
        if (agent) Object.assign(agent, patch);
      }),

    setLinks: (links) =>
      set((s) => {
        s.links = links;
      }),

    pushTokenSnapshot: (snap) =>
      set((s) => {
        s.tokenHistory = [...s.tokenHistory.slice(-59), snap];
      }),

    setAgentCosts: (costs) =>
      set((s) => {
        s.agentCosts = costs;
      }),

    updateMetrics: () => {
      const agents = Array.from(get().agents.values());
      const activeAgents = agents.filter(
        (a) => a.status === 'thinking' || a.status === 'tool_calling' || a.status === 'speaking',
      ).length;
      set((s) => {
        s.globalMetrics = {
          activeAgents,
          totalAgents: agents.length,
          totalTokens: s.globalMetrics.totalTokens,
          tokenRate: s.globalMetrics.tokenRate,
          collaborationHeat: s.globalMetrics.collaborationHeat,
        };
      });
    },

    startMovement: (agentId, toZone, targetPos) =>
      set((s) => {
        const agent = s.agents.get(agentId);
        if (!agent) return;
        const fromPos = agent.position;
        const path = planWalkPath(fromPos, targetPos ?? fromPos, agent.zone, toZone);
        const duration = calculateWalkDuration(path);
        agent.movement = {
          path,
          progress: 0,
          duration,
          startTime: Date.now(),
          fromZone: agent.zone,
          toZone,
        };
      }),

    tickMovement: (agentId, deltaTime) => {
      const agent = get().agents.get(agentId);
      if (!agent?.movement) return;
      const movement = agent.movement;
      const newProgress = Math.min(1, movement.progress + deltaTime / movement.duration);
      const newPos = interpolatePathPosition(movement.path, newProgress);
      set((s) => {
        const a = s.agents.get(agentId);
        if (!a?.movement) return;
        a.movement.progress = newProgress;
        a.position = newPos;
        if (newProgress >= 1) {
          a.zone = a.movement.toZone;
          a.movement = null;
        }
      });
    },

    completeMovement: (agentId) =>
      set((s) => {
        const agent = s.agents.get(agentId);
        if (!agent?.movement) return;
        const lastPoint = agent.movement.path[agent.movement.path.length - 1];
        if (lastPoint) agent.position = lastPoint;
        agent.zone = agent.movement.toZone;
        agent.movement = null;
      }),
  })),
);

// Alias: components import useOfficeStore from @/store/office-store (OC path)
// We export it here as useOfficeStore to be imported from our local path
export { useVisualOfficeStore as useOfficeStore };
