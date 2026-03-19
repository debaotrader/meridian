'use client';

import { WsProvider } from '@/lib/gateway/ws-provider';
import { I18nProvider } from './I18nProvider';
import { CrossModuleBridgeInitializer } from './CrossModuleBridgeInitializer';
import { AnalyticsBridgeInitializer } from './AnalyticsBridgeInitializer';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ?? 'ws://127.0.0.1:18789';
const API_KEY = process.env.NEXT_PUBLIC_OPENCLAW_API_KEY;

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <I18nProvider>
      <WsProvider url={GATEWAY_URL} apiKey={API_KEY}>
        <CrossModuleBridgeInitializer />
        <AnalyticsBridgeInitializer />
        {children}
      </WsProvider>
    </I18nProvider>
  );
}

export default ClientProviders;
