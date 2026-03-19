// Event parser for Meridian — standalone (no i18n dependency)

export type AgentVisualStatus =
  | 'idle'
  | 'thinking'
  | 'tool_calling'
  | 'speaking'
  | 'spawning'
  | 'error';

export interface ToolInfo {
  name: string;
  args?: Record<string, unknown>;
  startedAt: number;
}

export interface SpeechBubble {
  text: string;
  timestamp: number;
}

export interface AgentEventPayload {
  runId: string;
  seq?: number;
  stream: 'lifecycle' | 'tool' | 'assistant' | 'error' | string;
  ts: number;
  data: Record<string, unknown>;
  sessionKey?: string;
}

export interface ParsedAgentEvent {
  runId: string;
  sessionKey?: string;
  status: AgentVisualStatus;
  currentTool: ToolInfo | null;
  speechBubble: SpeechBubble | null;
  clearTool: boolean;
  clearSpeech: boolean;
  incrementToolCount: boolean;
  toolRecord: { name: string; timestamp: number } | null;
  summary: string;
}

export function parseAgentEvent(event: AgentEventPayload): ParsedAgentEvent {
  const base: ParsedAgentEvent = {
    runId: event.runId,
    sessionKey: event.sessionKey,
    status: 'idle',
    currentTool: null,
    speechBubble: null,
    clearTool: false,
    clearSpeech: false,
    incrementToolCount: false,
    toolRecord: null,
    summary: '',
  };

  switch (event.stream) {
    case 'lifecycle':
      return parseLifecycle(base, event);
    case 'tool':
      return parseTool(base, event);
    case 'assistant':
      return parseAssistant(base, event);
    case 'error':
      return parseError(base, event);
    default:
      base.summary = `Unknown stream: ${event.stream}`;
      return base;
  }
}

function parseLifecycle(result: ParsedAgentEvent, event: AgentEventPayload): ParsedAgentEvent {
  const phase = event.data.phase as string | undefined;
  switch (phase) {
    case 'start':
    case 'thinking':
      result.status = 'thinking';
      result.summary = phase === 'start' ? 'Agent started' : 'Thinking...';
      break;
    case 'end':
      result.status = 'idle';
      result.clearTool = true;
      result.clearSpeech = true;
      result.summary = 'Run ended';
      break;
    case 'fallback':
      result.status = 'error';
      result.summary = 'Fallback triggered';
      break;
    default:
      result.status = 'thinking';
      result.summary = `Lifecycle: ${phase ?? 'unknown'}`;
  }
  return result;
}

function parseTool(result: ParsedAgentEvent, event: AgentEventPayload): ParsedAgentEvent {
  const phase = event.data.phase as string | undefined;
  const name = (event.data.name as string) ?? 'unknown';
  if (phase === 'start') {
    result.status = 'tool_calling';
    result.currentTool = {
      name,
      args: event.data.args as Record<string, unknown> | undefined,
      startedAt: event.ts,
    };
    result.incrementToolCount = true;
    result.toolRecord = { name, timestamp: event.ts };
    result.summary = `Tool: ${name}`;
  } else {
    result.status = 'thinking';
    result.clearTool = true;
    result.summary = `Tool done: ${name}`;
  }
  return result;
}

function parseAssistant(result: ParsedAgentEvent, event: AgentEventPayload): ParsedAgentEvent {
  const text = (event.data.text as string) ?? '';
  result.status = 'speaking';
  result.speechBubble = { text, timestamp: event.ts };
  result.summary = text.length > 40 ? `${text.slice(0, 40)}...` : text;
  return result;
}

function parseError(result: ParsedAgentEvent, event: AgentEventPayload): ParsedAgentEvent {
  const message = (event.data.message as string) ?? 'Unknown error';
  result.status = 'error';
  result.summary = `Error: ${message}`;
  return result;
}

// ---------------------------------------------------------------------------
// CrossModuleEvent parser — all Gateway payloads must go through this before
// reaching components or stores (architectural rule, Phase 6).
// ---------------------------------------------------------------------------

import type { GatewayEvent } from './types';
import type { CrossModuleEvent } from '@/types/cross-module-events';

/**
 * Converts a raw GatewayEvent into a typed CrossModuleEvent.
 * Returns null if the event type is not handled by the cross-module bus.
 */
export function parseCrossModuleEvent(event: GatewayEvent): CrossModuleEvent | null {
  const ts = new Date(event.timestamp ?? event.ts ?? Date.now()).toISOString();
  const p = (event.payload ?? {}) as Record<string, unknown>;

  switch (event.type) {
    case 'task.dispatched': {
      const taskId = p.taskId as string | undefined;
      const agentId = p.agentId as string | undefined;
      const taskName = (p.taskName as string | undefined) ?? '';
      if (!taskId || !agentId) return null;
      return { type: 'task.dispatched', taskId, agentId, taskName, ts };
    }

    case 'task.completed': {
      const taskId = p.taskId as string | undefined;
      const agentId = p.agentId as string | undefined;
      if (!taskId || !agentId) return null;
      return { type: 'task.completed', taskId, agentId, ts };
    }

    case 'task.approved': {
      const taskId = p.taskId as string | undefined;
      const xpGained = (p.xpGained as number | undefined) ?? 0;
      if (!taskId) return null;
      return { type: 'task.approved', taskId, xpGained, ts };
    }

    case 'agent.message.delta': {
      const agentId = p.agentId as string | undefined;
      const markdown = (p.markdown as string | undefined) ?? (p.text as string | undefined) ?? '';
      if (!agentId) return null;
      return { type: 'agent.message.delta', agentId, markdown, ts };
    }

    case 'agent.status.changed': {
      const agentId = p.agentId as string | undefined;
      const status = p.status as 'idle' | 'working' | 'error' | undefined;
      if (!agentId || !status) return null;
      return { type: 'agent.status.changed', agentId, status, ts };
    }

    default:
      return null;
  }
}
