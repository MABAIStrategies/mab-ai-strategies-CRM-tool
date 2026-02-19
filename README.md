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

---

## Docker (Multi-Stage)

This repo includes a multi-stage `Dockerfile` tuned for Next.js App Router deployments with a minimal runtime image. It supports npm, pnpm, or yarn based on the detected lockfile. The final image runs the `server.js` produced by `next build` in standalone mode on port `8080` for Cloud Run compatibility.

**Build locally**

```bash
docker build -t mab-crm:local .
docker run --rm -p 8080:8080 mab-crm:local
```

---

## Cloud Run Deployment (Primary Path)

> **Goal:** Deploy the Next.js app to Cloud Run with Cloud SQL Postgres and a GCS bucket for asset storage.

### 1) Create Artifact Registry + build image

```bash
gcloud artifacts repositories create mab-crm \\
  --repository-format=docker \\
  --location=us-central1 \\
  --description=\"MAB CRM images\"

gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/mab-crm/web:latest .
```

### 2) Provision Cloud SQL (Postgres)

```bash
gcloud sql instances create mab-crm-pg \\
  --database-version=POSTGRES_15 \\
  --cpu=2 --memory=8GB \\
  --region=us-central1

gcloud sql databases create mab_crm --instance=mab-crm-pg
gcloud sql users set-password postgres \\
  --instance=mab-crm-pg --password='YOUR_STRONG_PASSWORD'
```

### 3) Create GCS bucket

```bash
gsutil mb -l us-central1 gs://$PROJECT_ID-mab-crm-assets
```

### 4) Deploy to Cloud Run

```bash
gcloud run deploy mab-crm-web \\
  --image us-central1-docker.pkg.dev/$PROJECT_ID/mab-crm/web:latest \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --set-env-vars \"NODE_ENV=production,PORT=8080\" \\
  --set-env-vars \"DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@/mab_crm?host=/cloudsql/$PROJECT_ID:us-central1:mab-crm-pg\" \\
  --set-env-vars \"GCS_BUCKET=$PROJECT_ID-mab-crm-assets\"
```

### 5) Optional: Run migrations

```bash
gcloud run jobs create mab-crm-migrate \\
  --image us-central1-docker.pkg.dev/$PROJECT_ID/mab-crm/web:latest \\
  --region us-central1 \\
  --set-env-vars \"DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@/mab_crm?host=/cloudsql/$PROJECT_ID:us-central1:mab-crm-pg\" \\
  --command \"npm\" \\
  --args \"run\",\"db:migrate\"

gcloud run jobs execute mab-crm-migrate --region us-central1
```

---

## Vercel Fallback Deployment

If Cloud Run is unavailable, Vercel can host the Next.js front-end while pointing to your managed Postgres instance.

1. **Import the repo** into Vercel.
2. **Set environment variables** in Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (if applicable)
   - `GCS_BUCKET` (or alternative asset store)
3. **Build settings**:
   - Framework preset: **Next.js**
   - Install command: `npm ci` (or `pnpm install --frozen-lockfile`)
   - Build command: `npm run build`
4. **Deploy**, then validate database connectivity from a staging environment.
