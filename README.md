# MAB AI Strategies — Local-First AI CRM (Codename: MAB-CRM)

A hyper-interactive, local-first CRM built for MAB AI Strategies to support heavy prospecting and discovery calls, minimize admin work via AI-assisted capture + memory, and centralize sales assets/templates.

## Core priorities
- Fast capture (<15 seconds) with keyboard-first UX.
- Persistent memory (entity-linked + semantic search).
- Sales asset repository + template engine.
- Reliable daily use (async AI jobs; UI never blocks).
- Local-first now, cloud-ready for Google Cloud Run later.

---

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind
- **Data**: Postgres + Prisma + pgvector (embeddings)
- **Async Jobs**: DB-backed job queue + worker (idempotent, retry-safe)
- **AI**: Provider abstraction (summarize/extract/embed/draft)
- **Local-first**: docker-compose for Postgres + pgvector
- **Cloud-ready**: Docker multi-stage build; Cloud Run + Cloud SQL + GCS (Phase 4)

---

## Async Jobs (Local Development)

This repo ships with a Postgres-backed job queue, worker, and a simple runner script.

1. **Apply the schema** (e.g. via psql):
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
2. **Install worker deps**:
   ```bash
   pip install psycopg2-binary
   ```
3. **Start the worker**:
   ```bash
   DATABASE_URL=postgres://user:pass@localhost:5432/mab_crm scripts/run_worker.sh
   ```
4. **Enqueue a sample job**:
   ```bash
   DATABASE_URL=postgres://user:pass@localhost:5432/mab_crm python scripts/enqueue_job.py
   ```

### Handler registration and dispatch pattern

The worker uses a **handler registry** (`self.handler_registry`) mapping job type strings to callables:

- `NOTE_PROCESS`
- `DEAL_STAGE_CHECKLIST`
- `ASSET_CLASSIFY`
- `MEMORY_EMBED`

Dispatch resolves handlers from this dictionary at runtime (`_handler_for`). This avoids brittle `if/elif` chains and makes extension straightforward: add a handler method and a single registry entry.

### Payload validation by job type

Validation runs at enqueue time using per-type payload rules:

- required fields
- optional fields
- expected field types

This catches malformed payloads before they reach worker execution.

### Dead-letter monitoring

When retries are exhausted (`max_attempts`), jobs are moved to `dead` status and the worker calls `dead_letter_handler`.

Default behavior logs an error event containing job id, type, attempt count, and last error. In production, replace or wrap this hook to emit alerts to Slack, PagerDuty, email, or your observability stack.

### Integration test for locking and idempotency

An integration test is available in `tests/test_job_worker_integration.py`. It requires a real Postgres URL:

```bash
TEST_DATABASE_URL=postgres://user:pass@localhost:5432/mab_crm_test python -m unittest discover -s tests -p 'test_job_worker_integration.py' -v
```

It verifies:
- idempotent enqueue returns the same job row for duplicate idempotency key
- concurrent workers do not lock/execute the same row simultaneously (`FOR UPDATE SKIP LOCKED`)
## Quickstart

### 1) Run Postgres + pgvector
Copy `.env.example` to `.env.local` and set database credentials for local usage.
```bash
docker compose up -d
```

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment
Create `.env` (see `.env.example`):
```bash
DATABASE_URL="postgresql://mab:mab@localhost:5432/mab_crm"
APP_URL="http://localhost:3000"
AI_RATE_LIMIT_PER_MINUTE="30"
AI_MAX_RETRIES="3"
AI_BACKOFF_MS="1000"
AI_COST_PER_1K_TOKENS="0.002"
PASSCODE="mab"
PASSCODE_HASH=""
AUTH_SECRET="change-me"
```

### 4) Run migrations + seed
```bash
npm run db:migrate
npm run db:seed
```

### 5) Start the app
```bash
npm run dev
```

### 6) Start the worker
```bash
npm run worker
```

---

## Key Features

- **Rapid capture drawer** for discovery calls with autosave and background AI jobs.
- **Command palette (⌘K)** and global search.
- **Memory Brain**: every note and activity generates searchable memory artifacts.
- **Sales asset repository** with tagging, status, and versioning.
- **Compliance mode** prevents outbound automation without explicit confirmation.

---

## AI Provider

The AI provider is abstracted via `src/lib/ai-provider.ts`. Local mode uses a mock provider; swap in your production provider by wiring environment variables.

---


## MCP Integration: Google Workspace (Gmail + Calendar)

This project now includes a Model Context Protocol-style integration pipeline that:

- Authenticates with Google OAuth2
- Syncs Gmail messages and Calendar events
- Extracts contacts + meeting notes into CRM records
- Creates `MemoryItem` rows for semantic retrieval
- Schedules automated recurring sync via worker jobs

### Setup

Add the following environment variables:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/integrations/google/callback
```

### API Endpoints

- `POST /api/integrations/google/connect`
  - Body: `{ "code": "oauth-auth-code", "redirectUri": "...optional..." }`
  - Exchanges auth code, stores connection + tokens

- `POST /api/integrations/google/sync`
  - Body optional: `{ "connectionId": "..." }`
  - Without `connectionId`, enqueues due scheduled sync jobs
  - With `connectionId`, enqueues an immediate manual sync

### Worker jobs

- `MCP_SYNC_GOOGLE_WORKSPACE` — sync Gmail + Calendar into CRM
- `MCP_SYNC_SCHEDULE` — recurring scheduler job for automatic sync

## Tests

```bash
npm test
npm run test:e2e
```

---

## Deployment

### Cloud Run (recommended for production)

This repo now includes a production helper script:

```bash
scripts/deploy-cloud-run.sh
```

#### One-time GCP setup
1. Install and authenticate gcloud:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```
2. Create or select a GCP project.
3. Create a Cloud SQL Postgres instance and database.
4. Build your production connection string (`DATABASE_URL`) using a private connector or Cloud SQL Auth Proxy strategy.

#### Deploy
Set required environment variables and run deploy:

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export CLOUD_RUN_SERVICE="mab-crm-prod"
export AR_REPO="mab-crm"
export DATABASE_URL="postgresql://..."
export AUTH_SECRET="long-random-secret"
export PASSCODE_HASH="bcrypt-hash"
export APP_URL="https://mab-crm-prod-xxxx.a.run.app"

scripts/deploy-cloud-run.sh
```

The script will:
- enable required APIs,
- create Artifact Registry repo if needed,
- build and push image via Cloud Build,
- deploy to Cloud Run with required env vars.

### Vercel (fallback)
- Configure Postgres (e.g., Neon + pgvector) and set `DATABASE_URL`.
- Build command: `npm run build`
- Output: Next.js default

---

## Backup & Security Notes

- **Local dev**: `docker compose` stores data in the `mab_pgdata` volume. Use `docker volume ls` to inspect and back up as needed.
- **Production**: use managed backups (Cloud SQL automated backups + PITR) and avoid exposing Postgres ports publicly.

---

## Troubleshooting

- **npm install 403**: If you see a `403 Forbidden` when installing Playwright packages, verify your `.npmrc` registry configuration or mirror access, and ensure your environment has access to the public npm registry or an internal proxy that allows `@playwright/test`.

---

## Repo Structure

- `app/` — Next.js App Router UI
- `src/lib/` — AI provider, jobs, business logic
- `prisma/` — schema + seed
- `docker-compose.yaml` — local Postgres + pgvector
- `Dockerfile` — Cloud Run build

---

## Assumptions

- Single-user local mode with local database.
- AI provider mocked locally; production provider to be configured by env.
- Assets stored locally with a future path to GCS.
 - Authentication uses a passcode in local mode; use `PASSCODE_HASH` in production and rotate `AUTH_SECRET`.
