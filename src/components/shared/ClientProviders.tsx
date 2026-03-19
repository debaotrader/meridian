'use client';

import { WsProvider } from '@/lib/gateway/ws-provider';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ?? 'ws://localhost:4001';
const API_KEY = process.env.NEXT_PUBLIC_OPENCLAW_API_KEY;

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <WsProvider url={GATEWAY_URL} apiKey={API_KEY}>
      {children}
    </WsProvider>
  );
}

export default ClientProviders;
