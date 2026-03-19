import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const taskId = searchParams.get('task_id');

  const sb = getSupabaseServer();
  let query = sb
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { task_id, agent_id, event_type, description, payload } = body;

  if (!event_type) {
    return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('activities')
    .insert({ task_id, agent_id, event_type, description, payload })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
