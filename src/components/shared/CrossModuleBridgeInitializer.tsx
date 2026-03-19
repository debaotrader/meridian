'use client';

import { useCrossModuleBridge } from '@/lib/gateway/cross-module-bridge';

/**
 * Mounts the cross-module bridge hook.
 * Must be rendered inside WsProvider.
 * Renders nothing — side-effects only.
 */
export function CrossModuleBridgeInitializer() {
  useCrossModuleBridge();
  return null;
}
