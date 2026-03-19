'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  ConnectionStatus,
  GatewayContextValue,
  GatewayEvent,
  GatewayEventHandler,
  GatewayState,
  UnsubscribeFn,
} from './types';

// Re-export for convenience
export type { ConnectionStatus, GatewayContextValue, GatewayEvent, GatewayState };

const BACKOFF_STEPS = [1000, 2000, 4000, 8000, 16000];

const GatewayContext = createContext<GatewayContextValue | null>(null);

export function useGateway(): GatewayContextValue {
  const ctx = useContext(GatewayContext);
  if (!ctx) throw new Error('useGateway must be used inside <WsProvider>');
  return ctx;
}

interface WsProviderProps {
  url: string;
  apiKey?: string;
  children: React.ReactNode;
}

export function WsProvider({ url, apiKey, children }: WsProviderProps) {
  const [state, setState] = useState<GatewayState>({
    status: 'disconnected',
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Subscriptions: Map<eventType, Set<handler>>
  // '*' = wildcard (all events)
  const subsRef = useRef<Map<string, Set<GatewayEventHandler>>>(new Map());

  const dispatch = useCallback((event: GatewayEvent) => {
    const subs = subsRef.current;
    // Specific subscribers
    const typed = subs.get(event.type);
    if (typed) for (const h of typed) h(event);
    // Wildcard subscribers
    const wild = subs.get('*');
    if (wild) for (const h of wild) h(event);
  }, []);

  const subscribe = useCallback(
    (eventType: string, handler: GatewayEventHandler): UnsubscribeFn => {
      const subs = subsRef.current;
      if (!subs.has(eventType)) subs.set(eventType, new Set());
      subs.get(eventType)!.add(handler);
      return () => {
        subs.get(eventType)?.delete(handler);
      };
    },
    [],
  );

  const send = useCallback((message: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('[WsProvider] send() called but socket not open');
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    setState({ status: 'reconnecting', error: null });

    let wsUrl = url;
    if (apiKey) {
      const sep = wsUrl.includes('?') ? '&' : '?';
      wsUrl = `${wsUrl}${sep}apiKey=${encodeURIComponent(apiKey)}`;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      setState({ status: 'connected', error: null });
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const raw = JSON.parse(evt.data as string) as Record<string, unknown>;
        const event: GatewayEvent = {
          type: (raw.type as string) ?? (raw.event as string) ?? 'message',
          payload: raw.payload ?? raw,
          ts: (raw.ts as number) ?? Date.now(),
        };
        dispatch(event);
      } catch {
        // Non-JSON frame — ignore
      }
    };

    ws.onerror = () => {
      // Error will be followed by onclose
    };

    ws.onclose = (evt) => {
      if (!mountedRef.current) return;
      wsRef.current = null;
      const attempt = attemptRef.current;
      const delay = BACKOFF_STEPS[Math.min(attempt, BACKOFF_STEPS.length - 1)];
      attemptRef.current = attempt + 1;
      setState({
        status: 'reconnecting',
        error: evt.reason || `Closed (${evt.code})`,
      });
      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [url, apiKey, dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null; // prevent reconnect loop on unmount
        ws.close();
        wsRef.current = null;
      }
      setState({ status: 'disconnected', error: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, apiKey]);

  const value: GatewayContextValue = { state, subscribe, send };

  return (
    <GatewayContext.Provider value={value}>{children}</GatewayContext.Provider>
  );
}

export default WsProvider;
