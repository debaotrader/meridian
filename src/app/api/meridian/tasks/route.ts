import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.getAll('status');

  const sb = getSupabaseServer();
  let query = sb.from('tasks').select('*').order('sort_order');

  if (status.length > 0) {
    query = query.in('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, status, priority, assigned_agent_id } = body;

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('tasks')
    .insert({ title, description, status, priority, assigned_agent_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing task id' }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
