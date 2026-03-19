import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const AGENTS_DIR = join(OPENCLAW_DIR, 'agents');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');

const MODEL_COSTS: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 },
  'claude-haiku-4-5': { input: 0.80, output: 4, cacheRead: 0.08, cacheWrite: 1.0 },
  'claude-opus-4-6': { input: 15, output: 75, cacheRead: 1.50, cacheWrite: 18.75 },
  'gemini-3-flash-preview': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  'delivery-mirror': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
};

function estimateCost(sess: any): number {
  const model = sess.model || '';
  const rates = MODEL_COSTS[model] || { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 };
  const input = (sess.inputTokens || 0) / 1_000_000 * rates.input;
  const output = (sess.outputTokens || 0) / 1_000_000 * rates.output;
  const cr = (sess.cacheRead || 0) / 1_000_000 * rates.cacheRead;
  const cw = (sess.cacheWrite || 0) / 1_000_000 * rates.cacheWrite;
  return input + output + cr + cw;
}

export async function GET() {
  try {
    const configPath = join(OPENCLAW_DIR, 'openclaw.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const agentList = config.agents?.list || [];

    interface SessionData {
      key: string; agentId: string; agentName: string; model: string; provider: string;
      channel: string; label: string; inputTokens: number; outputTokens: number;
      cacheRead: number; cacheWrite: number; totalTokens: number; cost: number;
      updatedAt: number; status: string;
    }

    const allSessions: SessionData[] = [];
    const agentMetrics: Array<{
      id: string; name: string; totalSessions: number; activeSessions: number;
      lastActivity: number; status: string; totalTokens: number; cost: number; model: string;
    }> = [];

    for (const agent of agentList) {
      const sessPath = join(AGENTS_DIR, agent.id, 'sessions', 'sessions.json');
      let totalSessions = 0, activeSessions = 0, lastActivity = 0, agentTokens = 0, agentCost = 0, agentModel = '';

      let name = agent.name || agent.id;
      if (agent.workspace) {
        const idPath = join(agent.workspace, 'IDENTITY.md');
        if (existsSync(idPath)) {
          try {
            const txt = readFileSync(idPath, 'utf-8');
            const m = txt.match(/\*\*(?:Name|Nome):\*\*\s*(.+)/);
            if (m) name = m[1].trim();
          } catch {}
        }
      }

      if (existsSync(sessPath)) {
        try {
          const sessions = JSON.parse(readFileSync(sessPath, 'utf-8'));
          for (const [key, sess] of Object.entries(sessions) as [string, any][]) {
            totalSessions++;
            const isActive = sess.status === 'active' || (sess.updatedAt && sess.updatedAt > Date.now() - 3 * 60_000);
            if (isActive) activeSessions++;
            if (sess.updatedAt > lastActivity) lastActivity = sess.updatedAt;

            const tokens = sess.totalTokens || 0;
            const cost = estimateCost(sess);
            agentTokens += tokens;
            agentCost += cost;
            if (!agentModel && sess.model) agentModel = sess.model;

            allSessions.push({
              key, agentId: agent.id, agentName: name,
              model: sess.model || 'unknown', provider: sess.modelProvider || 'unknown',
              channel: sess.lastChannel || sess.deliveryContext?.channel || 'internal',
              label: sess.label || key,
              inputTokens: sess.inputTokens || 0, outputTokens: sess.outputTokens || 0,
              cacheRead: sess.cacheRead || 0, cacheWrite: sess.cacheWrite || 0,
              totalTokens: tokens, cost, updatedAt: sess.updatedAt || 0,
              status: isActive ? 'active' : 'completed',
            });
          }
        } catch {}
      }

      let status = 'idle';
      if (activeSessions > 0) status = 'working';
      else if (lastActivity > Date.now() - 3 * 60_000) status = 'working';

      agentMetrics.push({ id: agent.id, name, totalSessions, activeSessions, lastActivity, status, totalTokens: agentTokens, cost: agentCost, model: agentModel });
    }

    // Aggregations
    const modelMap: Record<string, { tokens: number; cost: number; sessions: number }> = {};
    const channelMap: Record<string, { tokens: number; cost: number; sessions: number }> = {};
    let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheWrite = 0;

    for (const s of allSessions) {
      if (!modelMap[s.model]) modelMap[s.model] = { tokens: 0, cost: 0, sessions: 0 };
      modelMap[s.model].tokens += s.totalTokens;
      modelMap[s.model].cost += s.cost;
      modelMap[s.model].sessions++;

      if (!channelMap[s.channel]) channelMap[s.channel] = { tokens: 0, cost: 0, sessions: 0 };
      channelMap[s.channel].tokens += s.totalTokens;
      channelMap[s.channel].cost += s.cost;
      channelMap[s.channel].sessions++;

      totalInput += s.inputTokens;
      totalOutput += s.outputTokens;
      totalCacheRead += s.cacheRead;
      totalCacheWrite += s.cacheWrite;
    }

    const topModels = Object.entries(modelMap).map(([model, d]) => ({ model, ...d })).sort((a, b) => b.cost - a.cost);
    const topChannels = Object.entries(channelMap).map(([channel, d]) => ({ channel, ...d })).sort((a, b) => b.cost - a.cost);

    const totalTokens = allSessions.reduce((s, a) => s + a.totalTokens, 0);
    const totalCost = allSessions.reduce((s, a) => s + a.cost, 0);

    // Water cooler
    let wcMessages = 0, lastWcMessage: string | null = null;
    const chatPath = join(STATUS_DIR, 'chat.json');
    if (existsSync(chatPath)) {
      try {
        const chat = JSON.parse(readFileSync(chatPath, 'utf-8'));
        const messages = Array.isArray(chat) ? chat : chat.messages || [];
        wcMessages = messages.length;
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          lastWcMessage = `[${last.from}] ${(last.text || '').slice(0, 80)}`;
        }
      } catch {}
    }

    // Autowork
    let enabledAgents = 0;
    const awPath = join(STATUS_DIR, 'autowork.json');
    if (existsSync(awPath)) {
      try {
        const aw = JSON.parse(readFileSync(awPath, 'utf-8'));
        const policies = aw.policies || {};
        enabledAgents = Object.values(policies).filter((p: any) => p.enabled).length;
      } catch {}
    }

    // Activity (24h)
    const activity = allSessions
      .filter(s => s.updatedAt > Date.now() - 24 * 60 * 60_000)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 50)
      .map(s => ({ time: s.updatedAt, agent: s.agentName, type: s.status, model: s.model }));

    // Top sessions by cost
    const topSessions = [...allSessions]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 20)
      .map(s => ({ key: s.key, agent: s.agentName, model: s.model, channel: s.channel, label: s.label, tokens: s.totalTokens, cost: s.cost, updatedAt: s.updatedAt }));

    return NextResponse.json({
      agents: agentMetrics,
      totals: {
        totalAgents: agentMetrics.length,
        totalSessions: allSessions.length,
        activeSessions: agentMetrics.reduce((s, a) => s + a.activeSessions, 0),
        activeAgents: agentMetrics.filter(a => a.status === 'working').length,
        idleAgents: agentMetrics.filter(a => a.status === 'idle').length,
        totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
      },
      tokenBreakdown: { input: totalInput, output: totalOutput, cacheRead: totalCacheRead, cacheWrite: totalCacheWrite },
      topModels, topChannels, topSessions,
      waterCooler: { totalMessages: wcMessages, lastMessage: lastWcMessage },
      autowork: { enabledAgents },
      activity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
