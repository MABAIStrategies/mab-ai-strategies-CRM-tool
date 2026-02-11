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
