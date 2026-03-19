export type CrossModuleEvent =
  | { type: 'task.dispatched'; taskId: string; agentId: string; taskName: string; ts: string }
  | { type: 'task.completed'; taskId: string; agentId: string; ts: string }
  | { type: 'task.approved'; taskId: string; xpGained: number; ts: string }
  | { type: 'agent.message.delta'; agentId: string; markdown: string; ts: string }
  | { type: 'agent.status.changed'; agentId: string; status: 'idle' | 'working' | 'error'; ts: string }
