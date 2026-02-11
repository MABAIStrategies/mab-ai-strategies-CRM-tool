-- Job queue table for async work
DO $$
BEGIN
  CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'dead');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE job_type AS ENUM (
    'NOTE_PROCESS',
    'DEAL_STAGE_CHECKLIST',
    'ASSET_CLASSIFY',
    'MEMORY_EMBED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT UNIQUE,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 8 CHECK (max_attempts > 0),
  timeout_seconds INTEGER NOT NULL DEFAULT 120 CHECK (timeout_seconds > 0),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS jobs_status_run_at_idx ON jobs (status, run_at);
CREATE INDEX IF NOT EXISTS jobs_locked_at_idx ON jobs (locked_at);
CREATE INDEX IF NOT EXISTS jobs_type_status_idx ON jobs (type, status);
