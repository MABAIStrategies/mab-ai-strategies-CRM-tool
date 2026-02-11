# MAB AI Strategies — Local-First AI CRM (Codename: MAB-CRM)

A hyper-interactive, local-first CRM built for MAB AI Strategies to support heavy prospecting and discovery calls, minimize admin work via AI-assisted capture + memory, and centralize sales assets/templates.

**Core priorities**
- Fast capture (<15 seconds) with keyboard-first UX
- Persistent memory (entity-linked + semantic search)
- Sales asset repository + template engine
- Reliable daily use (async AI jobs; UI never blocks)
- Local-first now, cloud-ready for Google Cloud Run later

---

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Data**: Postgres + Prisma + pgvector (embeddings)
- **Async Jobs**: DB-backed job queue + worker (idempotent, retry-safe)
- **AI**: Provider abstraction (summarize/extract/embed/draft)
- **Local-first**: docker-compose for Postgres + pgvector
- **Cloud-ready**: Docker multi-stage build; Cloud Run + Cloud SQL + GCS (Phase 4)

---

## Repository Structure (expected)

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

5. **Behavior highlights**:
   - Row locking via `FOR UPDATE SKIP LOCKED` for safe multi-worker polling
   - Retries with exponential backoff + jitter
   - Enqueue idempotency via `idempotency_key`
   - Payload validation, timeout handling, structured logging, and graceful SIGTERM shutdown
