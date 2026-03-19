// Mock WebSocket adapter for Meridian development
// Simulates Gateway events without a real connection

export type MockEventEmitter = (type: string, payload: unknown) => void;

interface MockAgentEventOptions {
  emit: MockEventEmitter;
  agentIds?: string[];
  intervalMs?: number;
}

const MOCK_AGENTS = ['main', 'coder', 'ai-researcher'];
const MOCK_TOOLS = ['web_search', 'code_exec', 'file_read', 'bash'];
const MOCK_STREAMS = ['lifecycle', 'tool', 'assistant'] as const;

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Starts emitting mock agent events at a given interval.
 * Returns a stop function.
 */
export function startMockAdapter({
  emit,
  agentIds = MOCK_AGENTS,
  intervalMs = 3000,
}: MockAgentEventOptions): () => void {
  let seq = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];

  function scheduleEvent(delayMs: number) {
    const t = setTimeout(() => {
      const agentId = rand(agentIds);
      const stream = rand([...MOCK_STREAMS]);
      const runId = `mock-run-${agentId}`;
      const ts = Date.now();
      seq++;

      let data: Record<string, unknown> = {};

      if (stream === 'lifecycle') {
        data = { phase: rand(['thinking', 'end']), agentId };
      } else if (stream === 'tool') {
        data = { name: rand(MOCK_TOOLS), phase: rand(['start', 'end']) };
      } else {
        data = { text: `Agent ${agentId} processed task #${seq}` };
      }

      emit('agent', {
        runId,
        seq,
        stream,
        ts,
        data,
        sessionKey: `agent:${agentId}:main`,
      });

      scheduleEvent(intervalMs + Math.random() * 2000);
    }, delayMs);
    timers.push(t);
  }

  scheduleEvent(500);

  return () => {
    for (const t of timers) clearTimeout(t);
    timers.length = 0;
  };
}
