// Gateway types for Meridian — aligned with OpenClaw Gateway protocol v3

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface GatewayEvent {
  type: string;
  payload: unknown;
  ts: number;
}

export interface GatewayState {
  status: ConnectionStatus;
  error: string | null;
}

export type GatewayEventHandler = (event: GatewayEvent) => void;
export type UnsubscribeFn = () => void;

export interface GatewayContextValue {
  state: GatewayState;
  subscribe: (eventType: string, handler: GatewayEventHandler) => UnsubscribeFn;
  send: (message: unknown) => void;
}
