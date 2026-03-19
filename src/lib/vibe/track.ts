/**
 * Event tracking for OpenClawfice.
 * 
 * Dual-layer:
 * 1. Vercel Analytics (prod only, free tier) — pageviews + custom events
 * 2. Local JSONL log (localhost, where users actually run it) — full event stream
 * 
 * Events are fire-and-forget. Never block the UI.
 */
'use client';

import { track as vercelTrack } from '@vercel/analytics';
import { apiPath } from '@/lib/api-path';

// All trackable events — add new ones here
export type TrackEvent =
  // Page lifecycle
  | 'page_view'
  | 'session_start'
  | 'return_visit'
  // Demo flow
  | 'demo_started'
  | 'demo_tour_started'
  | 'demo_tour_completed'
  // Onboarding funnel
  | 'install_clicked'
  | 'install_copied'
  | 'first_agent_loaded'
  | 'first_task_completed'
  | 'onboarding_abandoned'
  // Feature engagement
  | 'npc_clicked'
  | 'quest_viewed'
  | 'cta_clicked'
  | 'card_viewed'
  | 'card_shared'
  | 'keyboard_shortcut'
  | 'konami_code'
  | 'music_toggled'
  | 'meeting_started'
  | 'water_cooler_opened'
  | 'settings_opened'
  // Template tracking
  | 'template_imported'
  | 'template_run'
  | 'template_customization_started'
  | 'template_field_changed'
  | 'template_customization_abandoned';

// Generate a simple session ID (persisted in sessionStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = sessionStorage.getItem('ocf-sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('ocf-sid', sid);
  }
  return sid;
}

// Get or create a visitor ID (persisted in localStorage for return visit detection)
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let vid = localStorage.getItem('ocf-vid');
  if (!vid) {
    vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('ocf-vid', vid);
  }
  return vid;
}

export function track(event: TrackEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const isDemoMode = params.get('demo') === 'true' || window.location.pathname === '/demo';

  const payload = {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    isDemoMode,
    ...props,
  };

  // 1. Vercel Analytics (prod) — only sends on Vercel deployment
  try {
    vercelTrack(event, props);
  } catch {
    // Silent fail — not on Vercel
  }

  // 2. Local JSONL log — always send (this is where real users run it)
  try {
    fetch(apiPath('/api/analytics/track'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // ensure delivery even on page unload
    }).catch(() => {});
  } catch {
    // Silent fail
  }
}

/**
 * Track time spent on a page/feature. Call on unmount.
 */
export function trackDuration(event: TrackEvent, startTime: number, props?: Record<string, string | number | boolean>) {
  const durationMs = Date.now() - startTime;
  track(event, { ...props, durationMs });
}
