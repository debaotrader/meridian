-- ============================================
-- Meridian — Supabase Schema
-- Schema separado do KB existente (public)
-- ============================================

-- Criar schema dedicado
CREATE SCHEMA IF NOT EXISTS meridian;

-- ============================================
-- TABELAS CORE
-- ============================================

-- Agentes registrados no sistema
CREATE TABLE IF NOT EXISTS meridian.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  color TEXT, -- hex color (ex: #FFD700 para Jarvis)
  role TEXT, -- executor, reviewer, approver, coordinator
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'working', 'idle', 'error')),
  capabilities JSONB DEFAULT '[]'::jsonb, -- array de capabilities
  metadata JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks (kanban cards)
CREATE TABLE IF NOT EXISTS meridian.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN (
    'backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'archived'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assigned_agent_id UUID REFERENCES meridian.agents(id) ON DELETE SET NULL,
  created_by TEXT, -- quem criou (agent name ou 'human')
  workspace_id UUID,
  parent_task_id UUID REFERENCES meridian.tasks(id) ON DELETE CASCADE, -- subtasks
  labels TEXT[] DEFAULT '{}',
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Atividades / eventos (live feed)
CREATE TABLE IF NOT EXISTS meridian.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES meridian.tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES meridian.agents(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- task.created, task.moved, agent.started, agent.completed, etc.
  description TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workspaces (projetos/espaços de trabalho)
CREATE TABLE IF NOT EXISTS meridian.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessões de agentes (tracking de trabalho)
CREATE TABLE IF NOT EXISTS meridian.agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES meridian.agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES meridian.tasks(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES meridian.workspaces(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'timeout')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,4) DEFAULT 0,
  summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Métricas agregadas (analytics)
CREATE TABLE IF NOT EXISTS meridian.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- tasks_completed, tokens_used, response_time, etc.
  agent_id UUID REFERENCES meridian.agents(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES meridian.workspaces(id) ON DELETE SET NULL,
  value NUMERIC NOT NULL,
  period TEXT DEFAULT 'daily' CHECK (period IN ('hourly', 'daily', 'weekly', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vibe / gamificação (XP, achievements, quests)
CREATE TABLE IF NOT EXISTS meridian.agent_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES meridian.agents(id) ON DELETE CASCADE,
  xp_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meridian.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES meridian.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  completed_by UUID REFERENCES meridian.agents(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_status ON meridian.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON meridian.tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON meridian.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sort ON meridian.tasks(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_activities_task ON meridian.activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_agent ON meridian.activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON meridian.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON meridian.activities(event_type);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON meridian.agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON meridian.agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_metrics_type_period ON meridian.metrics(metric_type, period_start);
CREATE INDEX IF NOT EXISTS idx_metrics_agent ON meridian.metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_xp_agent ON meridian.agent_xp(agent_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION meridian.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_agents_updated
  BEFORE UPDATE ON meridian.agents
  FOR EACH ROW EXECUTE FUNCTION meridian.update_updated_at();

CREATE OR REPLACE TRIGGER trg_tasks_updated
  BEFORE UPDATE ON meridian.tasks
  FOR EACH ROW EXECUTE FUNCTION meridian.update_updated_at();

CREATE OR REPLACE TRIGGER trg_workspaces_updated
  BEFORE UPDATE ON meridian.workspaces
  FOR EACH ROW EXECUTE FUNCTION meridian.update_updated_at();

-- ============================================
-- SEED: Agentes iniciais
-- ============================================

INSERT INTO meridian.agents (name, display_name, color, role, status) VALUES
  ('jarvis', 'Jarvis', '#FFD700', 'coordinator', 'online'),
  ('tony', 'Tony', '#FF4444', 'executor', 'offline'),
  ('banner', 'Banner', '#00CC66', 'executor', 'offline'),
  ('shuri', 'Shuri', '#A855F7', 'executor', 'offline'),
  ('parker', 'Parker', '#3B82F6', 'executor', 'offline'),
  ('visao', 'Visão', '#FF6B35', 'reviewer', 'offline')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- RLS (Row Level Security) — básico
-- ============================================

ALTER TABLE meridian.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.agent_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE meridian.quests ENABLE ROW LEVEL SECURITY;

-- Policy: service_role tem acesso total (o Meridian usa service_role key)
CREATE POLICY "service_role_all" ON meridian.agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.workspaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.agent_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.agent_xp FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON meridian.quests FOR ALL USING (true) WITH CHECK (true);

-- Policy: anon pode ler agentes e tasks (pra dashboard público futuro)
CREATE POLICY "anon_read_agents" ON meridian.agents FOR SELECT USING (true);
CREATE POLICY "anon_read_tasks" ON meridian.tasks FOR SELECT USING (true);
CREATE POLICY "anon_read_activities" ON meridian.activities FOR SELECT USING (true);

