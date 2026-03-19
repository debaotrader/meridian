// Office visual types — adapted from OpenClaw Office gateway/types.ts
// Used by office-2d, office-3d, and panel components

export type AgentVisualStatus =
  | 'idle'
  | 'thinking'
  | 'tool_calling'
  | 'speaking'
  | 'spawning'
  | 'error'
  | 'offline';

export type AgentStream = 'lifecycle' | 'tool' | 'assistant' | 'error';

export type AgentZone = 'desk' | 'meeting' | 'hotDesk' | 'lounge' | 'corridor';

export interface ToolInfo {
  name: string;
  args?: Record<string, unknown>;
  startedAt: number;
}

export interface SpeechBubble {
  text: string;
  timestamp: number;
}

export interface MovementState {
  path: Array<{ x: number; y: number }>;
  progress: number;
  duration: number;
  startTime: number;
  fromZone: AgentZone;
  toZone: AgentZone;
}

export interface ToolCallRecord {
  name: string;
  timestamp: number;
}

export interface VisualAgent {
  id: string;
  name: string;
  status: AgentVisualStatus;
  position: { x: number; y: number };
  currentTool: ToolInfo | null;
  speechBubble: SpeechBubble | null;
  lastActiveAt: number;
  toolCallCount: number;
  toolCallHistory: ToolCallRecord[];
  runId: string | null;
  isSubAgent: boolean;
  isPlaceholder: boolean;
  parentAgentId: string | null;
  childAgentIds: string[];
  zone: AgentZone;
  originalPosition: { x: number; y: number } | null;
  movement: MovementState | null;
  confirmed: boolean;
}

export interface CollaborationLink {
  sourceId: string;
  targetId: string;
  sessionKey: string;
  strength: number;
  lastActivityAt: number;
}

export interface EventHistoryItem {
  timestamp: number;
  agentId: string;
  agentName: string;
  stream: AgentStream;
  summary: string;
}

export interface SubAgentInfo {
  sessionKey: string;
  agentId: string;
  label: string;
  task: string;
  requesterSessionKey: string;
  startedAt: number;
}

export interface GlobalMetrics {
  activeAgents: number;
  totalAgents: number;
  totalTokens: number;
  tokenRate: number;
  collaborationHeat: number;
}

export interface TokenSnapshot {
  timestamp: number;
  total: number;
  byAgent: Record<string, number>;
}

export type ThemeMode = 'light' | 'dark';
export type ViewMode = '2d' | '3d';

// Stub types for view-models compatibility (not used by components)
export interface ChannelInfo { id: string; name: string; type: string; }
export interface CronTask { id: string; name: string; schedule: string; }
export interface SkillInfo { id: string; name: string; }
export interface UsageInfo { tokensIn: number; tokensOut: number; cost: number; }
