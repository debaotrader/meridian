'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseBrowser } from './browser';
import type { Agent, Task, Activity } from './types';

// ─── useSupabaseAgents ───────────────────────────────────────────────

export function useSupabaseAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();

    sb.from('agents')
      .select('*')
      .order('name')
      .then(({ data, error: err }: { data: Agent[] | null; error: { message: string } | null }) => {
        if (err) setError(err.message);
        else setAgents(data ?? []);
        setLoading(false);
      });

    const channel = sb
      .channel('meridian-agents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'meridian', table: 'agents' },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          if (payload.eventType === 'INSERT') {
            setAgents((prev) => [...prev, payload.new as Agent]);
          } else if (payload.eventType === 'UPDATE') {
            setAgents((prev) =>
              prev.map((a) => (a.id === (payload.new as Agent).id ? (payload.new as Agent) : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAgents((prev) => prev.filter((a) => a.id !== (payload.old as Partial<Agent>).id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  return { agents, loading, error };
}

// ─── useSupabaseTasks ────────────────────────────────────────────────

export function useSupabaseTasks(statusFilter?: string[]) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const filterKey = statusFilter?.join(',') ?? '';

  useEffect(() => {
    const sb = getSupabaseBrowser();

    let query = sb.from('tasks').select('*').order('sort_order');
    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }

    query.then(({ data, error: err }: { data: Task[] | null; error: { message: string } | null }) => {
      if (err) setError(err.message);
      else setTasks(data ?? []);
      setLoading(false);
    });

    const channel = sb
      .channel('meridian-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'meridian', table: 'tasks' },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (payload.eventType === 'INSERT') {
            const t = payload.new as Task;
            if (!statusFilter || statusFilter.includes(t.status)) {
              setTasks((prev) => [...prev, t]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const t = payload.new as Task;
            setTasks((prev) => {
              if (statusFilter && !statusFilter.includes(t.status)) {
                return prev.filter((x) => x.id !== t.id);
              }
              const exists = prev.some((x) => x.id === t.id);
              return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [...prev, t];
            });
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as Partial<Task>).id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { tasks, loading, error };
}

// ─── useSupabaseActivities ───────────────────────────────────────────

export function useSupabaseActivities(limit = 50) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();

    sb.from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }: { data: Activity[] | null }) => {
        if (data) setActivities(data);
        setLoading(false);
      });

    const channel = sb
      .channel('meridian-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'meridian', table: 'activities' },
        (payload: RealtimePostgresChangesPayload<Activity>) => {
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [limit]);

  return { activities, loading };
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useTaskMutations() {
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const sb = getSupabaseBrowser();
    const { error } = await sb.from('tasks').update(updates).eq('id', taskId);
    if (error) throw error;
  }, []);

  const createTask = useCallback(async (task: { title: string; description?: string; status?: string; priority?: string; assigned_agent_id?: string }) => {
    const sb = getSupabaseBrowser();
    const { data, error }: { data: Task | null; error: { message: string } | null } = await sb.from('tasks').insert(task).select().single();
    if (error) throw error;
    return data as Task;
  }, []);

  return { updateTask, createTask };
}
