/**
 * Supabase Database types for Meridian schema.
 * Manually maintained to match docs/supabase-schema.sql.
 */

export interface Database {
  meridian: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          display_name: string | null;
          avatar_url: string | null;
          color: string | null;
          role: string | null;
          status: 'online' | 'offline' | 'working' | 'idle' | 'error';
          capabilities: string[];
          metadata: Record<string, unknown>;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          role?: string | null;
          status?: 'online' | 'offline' | 'working' | 'idle' | 'error';
          capabilities?: string[];
          metadata?: Record<string, unknown>;
          last_seen_at?: string | null;
        };
        Update: Partial<Database['meridian']['Tables']['agents']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'archived';
          priority: 'critical' | 'high' | 'medium' | 'low';
          assigned_agent_id: string | null;
          created_by: string | null;
          workspace_id: string | null;
          parent_task_id: string | null;
          labels: string[];
          estimated_minutes: number | null;
          actual_minutes: number | null;
          started_at: string | null;
          completed_at: string | null;
          due_at: string | null;
          sort_order: number;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'archived';
          priority?: 'critical' | 'high' | 'medium' | 'low';
          assigned_agent_id?: string | null;
          created_by?: string | null;
          workspace_id?: string | null;
          parent_task_id?: string | null;
          labels?: string[];
          estimated_minutes?: number | null;
          sort_order?: number;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<Database['meridian']['Tables']['tasks']['Insert']>;
      };
      activities: {
        Row: {
          id: string;
          task_id: string | null;
          agent_id: string | null;
          event_type: string;
          description: string | null;
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          agent_id?: string | null;
          event_type: string;
          description?: string | null;
          payload?: Record<string, unknown>;
        };
        Update: Partial<Database['meridian']['Tables']['activities']['Insert']>;
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          settings?: Record<string, unknown>;
        };
        Update: Partial<Database['meridian']['Tables']['workspaces']['Insert']>;
      };
      agent_sessions: {
        Row: {
          id: string;
          agent_id: string;
          task_id: string | null;
          workspace_id: string | null;
          status: 'active' | 'completed' | 'failed' | 'timeout';
          started_at: string;
          ended_at: string | null;
          tokens_used: number;
          cost_usd: number;
          summary: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          agent_id: string;
          task_id?: string | null;
          workspace_id?: string | null;
          status?: 'active' | 'completed' | 'failed' | 'timeout';
          tokens_used?: number;
          cost_usd?: number;
          summary?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<Database['meridian']['Tables']['agent_sessions']['Insert']>;
      };
      metrics: {
        Row: {
          id: string;
          metric_type: string;
          agent_id: string | null;
          workspace_id: string | null;
          value: number;
          period: 'hourly' | 'daily' | 'weekly' | 'monthly';
          period_start: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_type: string;
          agent_id?: string | null;
          workspace_id?: string | null;
          value: number;
          period?: 'hourly' | 'daily' | 'weekly' | 'monthly';
          period_start: string;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<Database['meridian']['Tables']['metrics']['Insert']>;
      };
      agent_xp: {
        Row: {
          id: string;
          agent_id: string;
          xp_total: number;
          level: number;
          streak_days: number;
          last_activity_at: string | null;
          achievements: unknown[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          xp_total?: number;
          level?: number;
          streak_days?: number;
          achievements?: unknown[];
        };
        Update: Partial<Database['meridian']['Tables']['agent_xp']['Insert']>;
      };
      quests: {
        Row: {
          id: string;
          task_id: string | null;
          title: string;
          xp_reward: number;
          status: 'active' | 'completed' | 'expired';
          completed_by: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          title: string;
          xp_reward?: number;
          status?: 'active' | 'completed' | 'expired';
          completed_by?: string | null;
        };
        Update: Partial<Database['meridian']['Tables']['quests']['Insert']>;
      };
    };
  };
}

// Convenience aliases
export type Agent = Database['meridian']['Tables']['agents']['Row'];
export type Task = Database['meridian']['Tables']['tasks']['Row'];
export type Activity = Database['meridian']['Tables']['activities']['Row'];
export type Workspace = Database['meridian']['Tables']['workspaces']['Row'];
export type AgentSession = Database['meridian']['Tables']['agent_sessions']['Row'];
export type Metric = Database['meridian']['Tables']['metrics']['Row'];
export type AgentXP = Database['meridian']['Tables']['agent_xp']['Row'];
export type Quest = Database['meridian']['Tables']['quests']['Row'];
