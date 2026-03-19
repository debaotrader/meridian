import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client (service_role — full access).
 * Use ONLY in API routes / server components. Never expose to browser.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverClient: any = null; // justified: Supabase generic schema type mismatch

export function getSupabaseServer() {
  if (serverClient) return serverClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  serverClient = createClient(url, key, {
    db: { schema: 'meridian' },
    auth: { persistSession: false },
  });

  return serverClient;
}
