'use client';

import { useAnalyticsBridge } from '@/lib/gateway/analytics-bridge';

/**
 * Mounts the analytics bridge hook.
 * Polls /api/vibe/analytics and hydrates visual-office-store.
 * Renders nothing — side-effects only.
 */
export function AnalyticsBridgeInitializer() {
  useAnalyticsBridge();
  return null;
}
