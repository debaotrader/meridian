'use client';

import { useEffect, useRef } from 'react';
import { useOfficeStore } from '@/lib/store/visual-office-store';
import type { VisualAgent, EventHistoryItem, TokenSnapshot, CollaborationLink } from '@/lib/office/types';

const POLL_INTERVAL_MS = 15_000; // 15s refresh
const API_URL = '/meridian/api/vibe/analytics';

interface ApiAgent {
  id: string;
  name: string;
  totalSessions: number;
  activeSessions: number;
  lastActivity: number;
  status: string;
  totalTokens: number;
  cost: number;
  model: string;
}

interface ApiResponse {
  agents: ApiAgent[];
  totals: {
    totalAgents: number;
    totalSessions: number;
    activeSessions: number;
    activeAgents: number;
    idleAgents: number;
    totalTokens: number;
    totalCost: number;
  };
  tokenBreakdown: { input: number; output: number; cacheRead: number; cacheWrite: number };
  topModels: Array<{ model: string; tokens: number; cost: number; sessions: number }>;
  topChannels: Array<{ channel: string; tokens: number; cost: number; sessions: number }>;
  topSessions: Array<{ key: string; agent: string; model: string; channel: string; label: string; tokens: number; cost: number; updatedAt: number }>;
  activity: Array<{ time: number; agent: string; type: string; model: string }>;
  waterCooler: { totalMessages: number; lastMessage: string | null };
  autowork: { enabledAgents: number };
}

// Stable desk positions for agents (grid layout)
const DESK_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 120, y: 100 }, { x: 320, y: 100 }, { x: 520, y: 100 },
  { x: 120, y: 260 }, { x: 320, y: 260 }, { x: 520, y: 260 },
  { x: 120, y: 420 }, { x: 320, y: 420 }, { x: 520, y: 420 },
  { x: 120, y: 580 }, { x: 320, y: 580 }, { x: 520, y: 580 },
];

function mapAgentStatus(apiStatus: string): 'idle' | 'thinking' | 'tool_calling' {
  if (apiStatus === 'working') return 'thinking';
  return 'idle';
}

/**
 * Analytics Bridge — polls /api/vibe/analytics and hydrates
 * the visual-office-store so all analytics panels render real data.
 */
export function useAnalyticsBridge() {
  const upsertAgent = useOfficeStore((s) => s.upsertVisualAgent);
  const setAgentCosts = useOfficeStore((s) => s.setAgentCosts);
  const setLinks = useOfficeStore((s) => s.setLinks);
  const pushTokenSnapshot = useOfficeStore((s) => s.pushTokenSnapshot);
  const updateMetrics = useOfficeStore((s) => s.updateMetrics);
  const prevTokensRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAndHydrate() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) return;
        const data: ApiResponse = await res.json();
        if (!mounted) return;

        // 1. Upsert agents into visual-office-store
        const costs: Record<string, number> = {};
        data.agents.forEach((agent, i) => {
          const pos = DESK_POSITIONS[i % DESK_POSITIONS.length];
          const va: VisualAgent = {
            id: agent.id,
            name: agent.name,
            status: mapAgentStatus(agent.status),
            position: pos,
            currentTool: null,
            speechBubble: null,
            lastActiveAt: agent.lastActivity,
            toolCallCount: agent.totalSessions,
            toolCallHistory: [],
            runId: null,
            isSubAgent: false,
            isPlaceholder: false,
            parentAgentId: null,
            childAgentIds: [],
            zone: 'desk',
            originalPosition: pos,
            movement: null,
            confirmed: true,
          };
          upsertAgent(va);
          costs[agent.id] = agent.cost;
        });

        // 2. Set agent costs (feeds CostPieChart)
        setAgentCosts(costs);

        // 3. Push token snapshot (feeds TokenLineChart)
        const now = Date.now();
        const byAgent: Record<string, number> = {};
        data.agents.forEach((a) => { byAgent[a.id] = a.totalTokens; });
        const snap: TokenSnapshot = {
          timestamp: now,
          total: data.totals.totalTokens,
          byAgent,
        };
        pushTokenSnapshot(snap);

        // 4. Build collaboration links from activity (feeds NetworkGraph)
        // Create links between agents that share the same channel/model
        const links: CollaborationLink[] = [];
        const activeAgents = data.agents.filter(a => a.status === 'working' || a.totalSessions > 5);
        for (let i = 0; i < activeAgents.length; i++) {
          for (let j = i + 1; j < activeAgents.length; j++) {
            const a = activeAgents[i];
            const b = activeAgents[j];
            // Strength based on combined activity
            const strength = Math.min(1, (a.totalSessions + b.totalSessions) / 100);
            if (strength > 0.05) {
              links.push({
                sourceId: a.id,
                targetId: b.id,
                sessionKey: `${a.id}-${b.id}`,
                strength,
                lastActivityAt: Math.max(a.lastActivity, b.lastActivity),
              });
            }
          }
        }
        setLinks(links);

        // 5. Update global metrics
        // Compute token rate (tokens since last poll)
        const tokenDelta = data.totals.totalTokens - prevTokensRef.current;
        prevTokensRef.current = data.totals.totalTokens;
        const tokenRate = prevTokensRef.current === 0 ? 0 : Math.max(0, tokenDelta / (POLL_INTERVAL_MS / 1000));

        // Directly update globalMetrics in the store
        const store = useOfficeStore.getState();
        const agentsList = Array.from(store.agents.values());
        const activeCount = agentsList.filter(
          a => a.status === 'thinking' || a.status === 'tool_calling' || a.status === 'speaking'
        ).length;

        // Use the store's set via updateMetrics + manual globalMetrics patch
        useOfficeStore.setState((s) => ({
          ...s,
          globalMetrics: {
            activeAgents: activeCount,
            totalAgents: data.totals.totalAgents,
            totalTokens: data.totals.totalTokens,
            tokenRate,
            collaborationHeat: data.totals.activeSessions > 0
              ? Math.min(100, (data.totals.activeSessions / data.totals.totalAgents) * 100)
              : 0,
          },
          // 6. Hydrate eventHistory from activity (feeds ActivityHeatmap + EventTimeline)
          eventHistory: data.activity.map((act): EventHistoryItem => ({
            timestamp: act.time,
            agentId: data.agents.find(a => a.name === act.agent)?.id ?? act.agent,
            agentName: act.agent,
            stream: act.type === 'active' ? 'lifecycle' : 'assistant',
            summary: `${act.agent} — ${act.model} (${act.type})`,
          })),
        }));

      } catch (err) {
        // Silent fail — analytics is non-critical
        console.warn('[AnalyticsBridge] fetch failed:', err);
      }
    }

    // Initial fetch
    fetchAndHydrate();

    // Poll
    intervalRef.current = setInterval(fetchAndHydrate, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [upsertAgent, setAgentCosts, setLinks, pushTokenSnapshot, updateMetrics]);
}
