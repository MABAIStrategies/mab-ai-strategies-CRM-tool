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

## Local Development (Database)

### 1) Start Postgres + pgvector

```bash
docker compose up -d
```

This uses the `pgvector/pgvector` image so the `vector` extension is available for embeddings. When you initialize the database in your migrations, enable it with:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2) Configure `DATABASE_URL`

The application expects a `DATABASE_URL` environment variable.

```bash
DATABASE_URL="postgresql://mabcrm:mabcrm@localhost:5432/mabcrm?schema=public"
```

You can place this in your local `.env` file or export it in your shell before running the app.

---

## Repository Structure (expected)
