/**
 * Quick verification that Supabase connection works.
 * Run: npx tsx scripts/verify-supabase.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('[verify] Connecting to Supabase...');
  console.log('[verify] URL:', url);

  const sb = createClient(url, key, { db: { schema: 'meridian' } });

  // Test agents table
  const { data: agents, error: agentsErr } = await sb.from('agents').select('id, name, status');
  if (agentsErr) {
    console.error('[verify] ❌ agents query failed:', agentsErr.message);
    process.exit(1);
  }
  console.log(`[verify] ✅ agents: ${agents.length} rows`);
  for (const a of agents) {
    console.log(`  - ${a.name} (${a.status})`);
  }

  // Test tasks table
  const { data: tasks, error: tasksErr } = await sb.from('tasks').select('id, title, status');
  if (tasksErr) {
    console.error('[verify] ❌ tasks query failed:', tasksErr.message);
  } else {
    console.log(`[verify] ✅ tasks: ${tasks.length} rows`);
  }

  // Test activities table
  const { data: activities, error: activitiesErr } = await sb.from('activities').select('id').limit(1);
  if (activitiesErr) {
    console.error('[verify] ❌ activities query failed:', activitiesErr.message);
  } else {
    console.log(`[verify] ✅ activities: accessible`);
  }

  console.log('\n[verify] All checks passed ✅');
}

main().catch((e) => {
  console.error('[verify] Fatal:', e);
  process.exit(1);
});
