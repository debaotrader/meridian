import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { track } from '@/lib/vibe/track';
import { apiPath } from '@/lib/api-path';

/**
 * Demo Mode Hook - Detects demo mode and returns appropriate API paths
 * Activates when ?demo=true OR when on the /demo route
 */
export function useDemoMode() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isDemoMode] = useState(() => {
    // Works on both server and client in Next.js 15
    return searchParams?.get('demo') === 'true' || pathname === '/demo';
  });

  // Track demo mode entry
  useEffect(() => {
    if (isDemoMode) {
      track('demo_started');
    }
  }, [isDemoMode]);

  const getApiPath = useCallback((path: string) => {
    if (!isDemoMode) return path;
    
    const demoMap: Record<string, string> = {
      '/api/office': '/api/demo',
      '/api/office/actions': '/api/demo/actions',
      '/api/office/chat': '/api/demo/chat',
      '/api/office/meeting': '/api/demo/meeting',
      '/api/office/config': '/api/demo/config',
      '/api/office/autowork': '/api/demo/autowork',
      '/api/office/meeting/start': '/api/demo/meeting/start',
      '/api/office/message': '/api/demo/message',
      '/api/office/stop': '/api/demo/stop',
      '/api/office/challenges': '/api/demo/challenges',
    };
    
    return apiPath(demoMap[path] || path);
  }, [isDemoMode]);

  return {
    isDemoMode,
    getApiPath,
  };
}
