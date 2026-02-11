#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required (e.g. postgres://user:pass@localhost:5432/mab_crm)" >&2
  exit 1
fi

export LOG_LEVEL="${LOG_LEVEL:-INFO}"
export PYTHONUNBUFFERED=1

python -m worker.job_worker
