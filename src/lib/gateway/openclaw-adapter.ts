'use client';

/**
 * OpenClaw Gateway WebSocket Adapter
 *
 * Implements the OpenClaw WS protocol v3:
 * 1. Connect → receive connect.challenge
 * 2. Send req frame with method:"connect" + auth token
 * 3. Receive hello-ok → authenticated
 * 4. Receive event frames (health, agent, session events)
 * 5. Send req frames for RPC calls (sessions.list, agents.list, etc.)
 *
 * Event types emitted to subscribers:
 * - agent.status_changed
 * - task.assigned / task.completed / task.status_changed
 * - session.started / session.completed
 * - health
 */

import type { GatewayEvent, GatewayState } from './types';

interface OpenClawAdapterConfig {
  url: string;
  token?: string;
  reconnectMs?: number;
  maxReconnectMs?: number;
  protocol?: number;
}

type EventCallback = (event: GatewayEvent) => void;
type StateCallback = (state: GatewayState) => void;

let reqCounter = 0;
function nextReqId(): string {
  return `meridian-${++reqCounter}`;
}

export function createOpenClawAdapter(config: OpenClawAdapterConfig) {
  const {
    url,
    token,
    reconnectMs = 3000,
    maxReconnectMs = 30000,
    protocol = 3,
  } = config;

  let ws: WebSocket | null = null;
  let state: GatewayState = 'disconnected';
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let currentBackoff = reconnectMs;
  let intentionalClose = false;
  let connId: string | null = null;

  const eventListeners = new Map<string, Set<EventCallback>>();
  const stateListeners = new Set<StateCallback>();
  const pendingRequests = new Map<string, {
    resolve: (payload: unknown) => void; // justified: inherited from OpenClawfice merge
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  function setState(newState: GatewayState) {
    if (state === newState) return;
    state = newState;
    stateListeners.forEach((cb) => cb(newState));
  }

  function emit(eventType: string, event: GatewayEvent) {
    // Emit to specific listeners
    eventListeners.get(eventType)?.forEach((cb) => cb(event));
    // Emit to wildcard listeners
    eventListeners.get('*')?.forEach((cb) => cb(event));
  }

  function handleMessage(raw: string) {
    let msg: Record<string, unknown>; // justified: inherited from OpenClawfice merge
    try {
      msg = JSON.parse(raw);
    } catch {
      console.warn('[OpenClaw WS] Invalid JSON:', raw.slice(0, 100));
      return;
    }

    const type = msg.type as string;

    if (type === 'event') {
      const eventName = msg.event as string;
      const payload = (msg.payload ?? {}) as Record<string, unknown>;

      // Map OpenClaw events to Meridian gateway events
      const ts = (payload.ts as number) ?? Date.now();
      const gatewayEvent: GatewayEvent = {
        type: eventName,
        timestamp: ts,
        ts,
        payload,
      };

      emit(eventName, gatewayEvent);

      // Also emit mapped events for cross-module bridge compatibility
      if (eventName === 'agent') {
        const agentPayload = payload as Record<string, unknown>;
        const agentId = agentPayload.agentId as string | undefined;
        const status = agentPayload.status as string | undefined;
        if (agentId && status) {
          emit('agent.status_changed', {
            type: 'agent.status_changed',
            timestamp: Date.now(),
            ts: Date.now(),
            payload: { agentId, status, ...agentPayload },
          });
        }
      }
    } else if (type === 'res') {
      const id = msg.id as string;
      const pending = pendingRequests.get(id);
      if (pending) {
        pendingRequests.delete(id);
        clearTimeout(pending.timer);
        if (msg.ok) {
          pending.resolve(msg.payload);
        } else {
          const err = msg.error as Record<string, unknown> | undefined;
          pending.reject(new Error(
            (err?.message as string) ?? 'Unknown gateway error'
          ));
        }
      }
    }
  }

  function sendConnectFrame() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const frame = {
      type: 'req',
      id: nextReqId(),
      method: 'connect',
      params: {
        minProtocol: protocol,
        maxProtocol: protocol,
        client: {
          id: 'gateway-client',
          displayName: 'Meridian Dashboard',
          version: '1.0.0',
          platform: 'web',
          mode: 'backend',
        },
        ...(token ? { auth: { token } } : {}),
      },
    };

    const reqId = frame.id;

    // Listen for connect response
    const originalHandler = ws.onmessage;
    const connectPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 10000);

      const checkMessage = (ev: MessageEvent) => {
        let msg: Record<string, unknown>; // justified: inherited from OpenClawfice merge
        try {
          msg = JSON.parse(ev.data as string);
        } catch {
          return;
        }

        if (msg.type === 'res' && msg.id === reqId) {
          clearTimeout(timeout);
          if (msg.ok) {
            const payload = msg.payload as Record<string, unknown>;
            connId = (payload?.server as Record<string, unknown>)?.connId as string ?? null;
            setState('connected');
            currentBackoff = reconnectMs;
            resolve(true);
          } else {
            console.error('[OpenClaw WS] Connect rejected:', (msg.error as Record<string, unknown>)?.message);
            resolve(false);
          }
          // Remove this specific listener, keep normal handler
          ws?.removeEventListener('message', checkMessage);
        }
      };

      ws?.addEventListener('message', checkMessage);
    });

    ws.send(JSON.stringify(frame));
    return connectPromise;
  }

  function connect() {
    if (ws) {
      try { ws.close(); } catch { /* ignore */ }
      ws = null;
    }

    setState('connecting');
    intentionalClose = false;

    try {
      ws = new WebSocket(url);
    } catch (err) {
      console.error('[OpenClaw WS] Failed to create WebSocket:', err);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      // Wait for connect.challenge event, then send connect frame
    };

    ws.onmessage = (ev) => {
      const raw = ev.data as string;
      let msg: Record<string, unknown>; // justified: inherited from OpenClawfice merge
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      // During handshake: wait for challenge then connect
      if (state === 'connecting' && msg.type === 'event' && msg.event === 'connect.challenge') {
        sendConnectFrame();
        return;
      }

      // After connected: dispatch normally
      if (state === 'connected') {
        handleMessage(raw);
      }
    };

    ws.onerror = (err) => {
      console.warn('[OpenClaw WS] Error:', err);
    };

    ws.onclose = (ev) => {
      connId = null;
      if (!intentionalClose) {
        setState('reconnecting');
        scheduleReconnect();
      } else {
        setState('disconnected');
      }
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, currentBackoff);
    currentBackoff = Math.min(currentBackoff * 1.5, maxReconnectMs);
  }

  function disconnect() {
    intentionalClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    pendingRequests.forEach((p) => {
      clearTimeout(p.timer);
      p.reject(new Error('Disconnected'));
    });
    pendingRequests.clear();
    if (ws) {
      try { ws.close(1000, 'client disconnect'); } catch { /* ignore */ }
      ws = null;
    }
    setState('disconnected');
  }

  /** Send a JSON-RPC request to the gateway */
  function request<T = unknown>(method: string, params?: unknown, timeoutMs = 15000): Promise<T> { // justified: inherited from OpenClawfice merge
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN || state !== 'connected') {
        reject(new Error('Not connected'));
        return;
      }

      const id = nextReqId();
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, timeoutMs);

      pendingRequests.set(id, {
        resolve: resolve as (payload: unknown) => void, // justified: inherited from OpenClawfice merge
        reject,
        timer,
      });

      const frame = { type: 'req', id, method, params };
      ws.send(JSON.stringify(frame));
    });
  }

  /** Subscribe to a specific event type (or '*' for all) */
  function subscribe(eventType: string, callback: EventCallback): () => void {
    if (!eventListeners.has(eventType)) {
      eventListeners.set(eventType, new Set());
    }
    eventListeners.get(eventType)!.add(callback);

    return () => {
      eventListeners.get(eventType)?.delete(callback);
      if (eventListeners.get(eventType)?.size === 0) {
        eventListeners.delete(eventType);
      }
    };
  }

  /** Subscribe to state changes */
  function onStateChange(callback: StateCallback): () => void {
    stateListeners.add(callback);
    return () => { stateListeners.delete(callback); };
  }

  /** Get current connection state */
  function getState(): GatewayState {
    return state;
  }

  /** Get current connection ID */
  function getConnId(): string | null {
    return connId;
  }

  return {
    connect,
    disconnect,
    subscribe,
    onStateChange,
    getState,
    getConnId,
    request,
  };
}

export type OpenClawAdapter = ReturnType<typeof createOpenClawAdapter>;
