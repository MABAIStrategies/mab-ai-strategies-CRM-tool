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

