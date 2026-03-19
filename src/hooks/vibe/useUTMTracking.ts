'use client';

import { useEffect } from 'react';
import { track } from '@/lib/vibe/track';

/**
 * Captures UTM parameters and tracks page views.
 * Call once in the main page component.
 * 
 * Sends to both:
 * - Vercel Analytics (prod, automatic)
 * - Local JSONL log (/api/analytics/track, for localhost users)
 */
export function useUTMTracking() {
  useEffect(() => {
    try {
      // Track page view — UTM params are captured automatically by track()
      track('page_view');

      // Detect return visitors
      const lastVisit = localStorage.getItem('ocf-last-visit');
      if (lastVisit) {
        const daysSince = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
        if (daysSince >= 1) {
          track('return_visit', { daysSinceLastVisit: Math.floor(daysSince) });
        }
      }
      localStorage.setItem('ocf-last-visit', Date.now().toString());
    } catch {
      // Ignore
    }
  }, []);
}
