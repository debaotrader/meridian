// Gateway types for Meridian — aligned with OpenClaw Gateway protocol v3

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

export interface GatewayEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  /** @deprecated Use timestamp */
  ts: number;
}

export type GatewayState = ConnectionStatus;

export interface GatewayStateObj {
  status: ConnectionStatus;
  error: string | null;
}

export type GatewayEventHandler = (event: GatewayEvent) => void;
export type UnsubscribeFn = () => void;

export interface GatewayContextValue {
  state: GatewayStateObj;
  subscribe: (eventType: string, handler: GatewayEventHandler) => UnsubscribeFn;
  send: (message: unknown) => void;
}
