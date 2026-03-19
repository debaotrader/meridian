import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client (anon key — read-only via RLS).
 * Used for realtime subscriptions and public reads.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: any = null; // justified: Supabase generic schema type mismatch

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createClient(url, key, {
    db: { schema: 'meridian' },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return browserClient;
}
