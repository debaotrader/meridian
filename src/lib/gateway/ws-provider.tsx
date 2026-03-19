'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createOpenClawAdapter, type OpenClawAdapter } from './openclaw-adapter';
import type {
  ConnectionStatus,
  GatewayContextValue,
  GatewayEvent,
  GatewayEventHandler,
  GatewayState,
  GatewayStateObj,
  UnsubscribeFn,
} from './types';

export type { ConnectionStatus, GatewayContextValue, GatewayEvent, GatewayState, GatewayStateObj };

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

/**
 * WsProvider — wraps the OpenClaw Gateway WS protocol v3.
 *
 * Handles: challenge → connect handshake → event streaming.
 * Reconnects automatically with exponential backoff.
 */
export function WsProvider({ url, apiKey, children }: WsProviderProps) {
  const [state, setState] = useState<GatewayStateObj>({
    status: 'disconnected',
    error: null,
  });

  const adapterRef = useRef<OpenClawAdapter | null>(null);
  const mountedRef = useRef(true);

  // Subscriptions: Map<eventType, Set<handler>>
  const subsRef = useRef<Map<string, Set<GatewayEventHandler>>>(new Map());

  const dispatch = useCallback((event: GatewayEvent) => {
    const subs = subsRef.current;
    const typed = subs.get(event.type);
    if (typed) for (const h of typed) h(event);
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
    // For backwards compatibility, raw send.
    // Prefer adapter.request() for RPC calls.
    const adapter = adapterRef.current;
    if (!adapter) {
      console.warn('[WsProvider] send() called but no adapter');
      return;
    }
    // If message looks like an RPC call, route through request()
    const msg = message as Record<string, unknown>; // justified: inherited from OpenClawfice merge
    if (msg.method && typeof msg.method === 'string') {
      adapter.request(msg.method, msg.params).catch((err) => {
        console.warn('[WsProvider] RPC error:', err);
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const adapter = createOpenClawAdapter({
      url,
      token: apiKey,
      reconnectMs: 2000,
      maxReconnectMs: 30000,
      protocol: 3,
    });

    adapterRef.current = adapter;

    // Map adapter state → component state
    adapter.onStateChange((adapterState) => {
      if (!mountedRef.current) return;
      const statusMap: Record<string, ConnectionStatus> = {
        disconnected: 'disconnected',
        connecting: 'reconnecting',
        connected: 'connected',
        reconnecting: 'reconnecting',
      };
      setState({
        status: statusMap[adapterState] ?? 'disconnected',
        error: null,
      });
    });

    // Forward all adapter events to subscribers
    adapter.subscribe('*', (event) => {
      if (!mountedRef.current) return;
      dispatch(event);
    });

    adapter.connect();

    return () => {
      mountedRef.current = false;
      adapter.disconnect();
      adapterRef.current = null;
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
