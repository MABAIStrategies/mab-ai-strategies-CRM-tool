#!/usr/bin/env bash
set -euo pipefail

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Error: gcloud CLI is not installed."
  echo "Install: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION (example: us-central1)}"
: "${CLOUD_RUN_SERVICE:?Set CLOUD_RUN_SERVICE (example: mab-crm-prod)}"
: "${AR_REPO:?Set AR_REPO (example: mab-crm)}"
: "${DATABASE_URL:?Set DATABASE_URL for production Cloud SQL connection}"
: "${AUTH_SECRET:?Set AUTH_SECRET}"
: "${PASSCODE_HASH:?Set PASSCODE_HASH (bcrypt hash)}"
: "${APP_URL:?Set APP_URL (your Cloud Run URL or custom domain)}"

IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${AR_REPO}/${CLOUD_RUN_SERVICE}:${GIT_SHA:-$(git rev-parse --short HEAD)}"


echo "==> Setting gcloud project"
gcloud config set project "${GCP_PROJECT_ID}"

echo "==> Enabling required APIs"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

echo "==> Ensuring Artifact Registry repository exists"
if ! gcloud artifacts repositories describe "${AR_REPO}" --location="${GCP_REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${AR_REPO}" \
    --repository-format=docker \
    --location="${GCP_REGION}" \
    --description="MAB CRM production images"
fi

echo "==> Building and pushing container image: ${IMAGE}"
gcloud builds submit --tag "${IMAGE}" .

echo "==> Deploying Cloud Run service: ${CLOUD_RUN_SERVICE}"
gcloud run deploy "${CLOUD_RUN_SERVICE}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${GCP_REGION}" \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production,APP_URL=${APP_URL},DATABASE_URL=${DATABASE_URL},AUTH_SECRET=${AUTH_SECRET},PASSCODE_HASH=${PASSCODE_HASH}"

echo "==> Cloud Run service URL"
gcloud run services describe "${CLOUD_RUN_SERVICE}" \
  --region "${GCP_REGION}" \
  --format='value(status.url)'
