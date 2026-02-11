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
