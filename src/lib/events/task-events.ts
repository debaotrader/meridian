// Simple client-side event bus for cross-module communication
type TaskEventHandler = (event: TaskEvent) => void;

export interface TaskEvent {
  type: 'task.assigned' | 'task.completed' | 'task.status_changed';
  taskId: string;
  taskName?: string;
  agentId?: string;
  status?: string;
  timestamp: number;
}

const handlers = new Set<TaskEventHandler>();

export function onTaskEvent(handler: TaskEventHandler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function emitTaskEvent(event: TaskEvent) {
  handlers.forEach((h) => h(event));
}
