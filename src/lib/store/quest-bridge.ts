'use client';

import { create } from 'zustand';

export interface Quest {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  agentName?: string;
  status: 'active' | 'completed' | 'failed';
  xpReward: number;
  startedAt: number;
  completedAt?: number;
}

interface QuestBridgeState {
  quests: Quest[];
  totalXp: number;
  addQuest: (quest: Quest) => void;
  completeQuest: (taskId: string) => void;
  syncFromTasks: (
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      assigned_agent_id?: string | null;
      description?: string;
    }>,
    agents: Array<{ id: string; name: string }>,
  ) => void;
}

function calculateXp(status: string): number {
  switch (status) {
    case 'done':
      return 100;
    case 'review':
      return 50;
    case 'testing':
      return 75;
    default:
      return 25;
  }
}

export const useQuestBridge = create<QuestBridgeState>((set) => ({
  quests: [],
  totalXp: 0,

  addQuest: (quest) =>
    set((state) => ({
      quests: [...state.quests, quest],
    })),

  completeQuest: (taskId) =>
    set((state) => {
      const quest = state.quests.find(
        (q) => q.taskId === taskId && q.status === 'active',
      );
      if (!quest) return state;
      return {
        quests: state.quests.map((q) =>
          q.taskId === taskId && q.status === 'active'
            ? { ...q, status: 'completed' as const, completedAt: Date.now() }
            : q,
        ),
        totalXp: state.totalXp + quest.xpReward,
      };
    }),

  syncFromTasks: (tasks, agents) => {
    const agentMap = new Map(agents.map((a) => [a.id, a.name]));
    const quests: Quest[] = tasks
      .filter((t) => t.status !== 'backlog' && t.status !== 'archived')
      .map((t) => ({
        id: `quest-${t.id}`,
        taskId: t.id,
        title: t.title,
        description: t.description,
        agentName: t.assigned_agent_id
          ? agentMap.get(t.assigned_agent_id)
          : undefined,
        status: t.status === 'done' ? ('completed' as const) : ('active' as const),
        xpReward: calculateXp(t.status),
        startedAt: Date.now(),
        completedAt: t.status === 'done' ? Date.now() : undefined,
      }));

    set({
      quests,
      totalXp: quests
        .filter((q) => q.status === 'completed')
        .reduce((sum, q) => sum + q.xpReward, 0),
    });
  },
}));
