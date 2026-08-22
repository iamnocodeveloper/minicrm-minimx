-- ============================================================
-- MiniCRM AI — initial schema for InsForge / PostgreSQL
-- ============================================================
-- Run via:
--   npx -y @insforge/cli db migrations up --all
-- or paste this SQL into:
--   npx -y @insforge/cli db query < supabase/migrations/0001_minicrm_init.sql
--
-- Notes:
--   * Uses InsForge's built-in auth schema (`auth.users`,
--     `auth.uid()`, `system.update_updated_at()`) — no Supabase-
--     specific dependencies.
--   * Per-user isolation is enforced by Row Level Security on every
--     public table. Multi-tenant safety does NOT rely on the client.
--   * `profile` data lives in auth.users.profile JSONB (set by the
--     InsForge auth SDK). No public.profiles table is created by
--     design — the spec mentions a "profiles" entity, which we model
--     as a convenient SECURE VIEW on top of auth.users.profile.
-- ============================================================

-- -- 0. Required extensions (gen_random_uuid is provided by pgcrypto,
-- -- already available in modern Postgres; uncomment if your backend
-- -- is on an older image).
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- public.clients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT,
  phone       TEXT,
  value       NUMERIC(14, 2) CHECK (value IS NULL OR value >= 0),
  status      TEXT NOT NULL DEFAULT 'novo_lead'
                CHECK (status IN ('novo_lead', 'contato', 'proposta', 'negociacao', 'fechado')),
  priority    TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  source      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id        ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_status    ON public.clients(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_user_created   ON public.clients(user_id, created_at DESC);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_select_own  ON public.clients;
DROP POLICY IF EXISTS clients_insert_own  ON public.clients;
DROP POLICY IF EXISTS clients_update_own  ON public.clients;
DROP POLICY IF EXISTS clients_delete_own  ON public.clients;

CREATE POLICY clients_select_own ON public.clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY clients_insert_own ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY clients_update_own ON public.clients
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY clients_delete_own ON public.clients
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ------------------------------------------------------------
-- public.activities
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'whatsapp', 'note')),
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id    ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client    ON public.activities(client_id);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activities_select_own ON public.activities;
DROP POLICY IF EXISTS activities_insert_own ON public.activities;
DROP POLICY IF EXISTS activities_update_own ON public.activities;
DROP POLICY IF EXISTS activities_delete_own ON public.activities;

CREATE POLICY activities_select_own ON public.activities
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY activities_insert_own ON public.activities
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY activities_update_own ON public.activities
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY activities_delete_own ON public.activities
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- public.tasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_due    ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_comp   ON public.tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_client      ON public.tasks(client_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_own ON public.tasks;
DROP POLICY IF EXISTS tasks_insert_own ON public.tasks;
DROP POLICY IF EXISTS tasks_update_own ON public.tasks;
DROP POLICY IF EXISTS tasks_delete_own ON public.tasks;

CREATE POLICY tasks_select_own ON public.tasks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY tasks_insert_own ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      client_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_id AND c.user_id = auth.uid()
      )
    )
  );

CREATE POLICY tasks_update_own ON public.tasks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tasks_delete_own ON public.tasks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ------------------------------------------------------------
-- public.pipeline_stages (user-customizable; data-driven)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_user_pos
  ON public.pipeline_stages(user_id, position);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pipeline_stages_select_own ON public.pipeline_stages;
DROP POLICY IF EXISTS pipeline_stages_insert_own ON public.pipeline_stages;
DROP POLICY IF EXISTS pipeline_stages_update_own ON public.pipeline_stages;
DROP POLICY IF EXISTS pipeline_stages_delete_own ON public.pipeline_stages;

CREATE POLICY pipeline_stages_select_own ON public.pipeline_stages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY pipeline_stages_insert_own ON public.pipeline_stages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY pipeline_stages_update_own ON public.pipeline_stages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY pipeline_stages_delete_own ON public.pipeline_stages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- secure view: public.profile  (read-only projection over auth.users)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.profile AS
SELECT
  u.id,
  u.email,
  u.profile->>'name'        AS full_name,
  u.profile->>'avatar_url'  AS avatar_url,
  u.created_at
FROM auth.users u
WHERE u.id = auth.uid();

GRANT SELECT ON public.profile TO authenticated;

-- ------------------------------------------------------------
-- Grants (RLS still filters rows; GRANT makes the tables reachable)
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_stages TO authenticated;
