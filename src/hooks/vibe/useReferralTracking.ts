'use client';

import { useEffect } from 'react';

/**
 * Referral tracking hook.
 * 
 * When a visitor arrives with ?ref=creator-name:
 * 1. Stores the ref code in localStorage (persists across sessions)
 * 2. Sets a cookie for server-side access (30 days)
 * 3. Sends a referral event to /api/affiliate/track
 * 
 * Attribution window: 30 days from first click.
 */

const REF_KEY = 'ocf-ref';
const REF_TIMESTAMP_KEY = 'ocf-ref-ts';
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

export function useReferralTracking() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');

      if (ref && ref.trim()) {
        // Check if there's an existing attribution that's still valid
        const existingRef = localStorage.getItem(REF_KEY);
        const existingTs = localStorage.getItem(REF_TIMESTAMP_KEY);

        if (existingRef && existingTs) {
          const age = Date.now() - parseInt(existingTs);
          if (age < ATTRIBUTION_WINDOW_MS) {
            // Existing attribution still valid — don't override (first-click wins)
            return;
          }
        }

        // Store new attribution
        localStorage.setItem(REF_KEY, ref.trim());
        localStorage.setItem(REF_TIMESTAMP_KEY, Date.now().toString());
        setCookie('ocf_ref', ref.trim(), 30);

        // Track the referral click
        const visitorId = localStorage.getItem('ocf-vid') || 'unknown';
        fetch('/api/affiliate/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'click',
            ref: ref.trim(),
            visitorId,
            page: window.location.pathname,
            timestamp: Date.now(),
          }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Silent fail
    }
  }, []);
}

/**
 * Get the current referral attribution (if any).
 * Returns null if no attribution or if expired.
 */
export function getAttribution(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const ref = localStorage.getItem(REF_KEY);
    const ts = localStorage.getItem(REF_TIMESTAMP_KEY);
    if (!ref || !ts) return null;

    const age = Date.now() - parseInt(ts);
    if (age > ATTRIBUTION_WINDOW_MS) {
      // Expired
      localStorage.removeItem(REF_KEY);
      localStorage.removeItem(REF_TIMESTAMP_KEY);
      return null;
    }

    return ref;
  } catch {
    return null;
  }
}
