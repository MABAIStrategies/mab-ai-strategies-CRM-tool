import json
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, Optional

import psycopg2
import psycopg2.extras

JOB_TYPES = {
    "NOTE_PROCESS",
    "DEAL_STAGE_CHECKLIST",
    "ASSET_CLASSIFY",
    "MEMORY_EMBED",
}

DEFAULT_LOCK_TIMEOUT_SECONDS = 60
DEFAULT_POLL_INTERVAL_SECONDS = 1
DEFAULT_BACKOFF_BASE_SECONDS = 5


@dataclass
class Job:
    id: int
    type: str
    payload: Dict[str, Any]
    attempts: int
    max_attempts: int


class JobWorker:
    def __init__(
        self,
        database_url: str,
        worker_id: str,
        lock_timeout_seconds: int = DEFAULT_LOCK_TIMEOUT_SECONDS,
        poll_interval_seconds: int = DEFAULT_POLL_INTERVAL_SECONDS,
        backoff_base_seconds: int = DEFAULT_BACKOFF_BASE_SECONDS,
    ) -> None:
        self.database_url = database_url
        self.worker_id = worker_id
        self.lock_timeout_seconds = lock_timeout_seconds
        self.poll_interval_seconds = poll_interval_seconds
        self.backoff_base_seconds = backoff_base_seconds

    def run_forever(self) -> None:
        while True:
            job = self._lock_next_job()
            if not job:
                time.sleep(self.poll_interval_seconds)
                continue
            self._process_job(job)

    def _connect(self):
        return psycopg2.connect(self.database_url)

    def _lock_next_job(self) -> Optional[Job]:
        lock_timeout = datetime.now(timezone.utc) - timedelta(
            seconds=self.lock_timeout_seconds
        )
        with self._connect() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(
                    """
                    SELECT *
                    FROM jobs
                    WHERE status = 'queued'
                      AND run_at <= NOW()
                      AND (locked_at IS NULL OR locked_at < %s)
                    ORDER BY run_at ASC
                    FOR UPDATE SKIP LOCKED
                    LIMIT 1
                    """,
                    (lock_timeout,),
                )
                row = cursor.fetchone()
                if not row:
                    return None

                cursor.execute(
                    """
                    UPDATE jobs
                    SET status = 'processing',
                        locked_at = NOW(),
                        locked_by = %s,
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (self.worker_id, row["id"]),
                )
                conn.commit()

                payload = row.get("payload") or {}
                return Job(
                    id=row["id"],
                    type=row["type"],
                    payload=payload,
                    attempts=row["attempts"],
                    max_attempts=row["max_attempts"],
                )

    def _process_job(self, job: Job) -> None:
        handler = self._handler_for(job.type)
        try:
            handler(job.payload)
            self._mark_completed(job.id)
        except Exception as exc:  # noqa: BLE001
            self._mark_failed(job, str(exc))

    def _handler_for(self, job_type: str) -> Callable[[Dict[str, Any]], None]:
        if job_type not in JOB_TYPES:
            return self._handle_unknown
        return {
            "NOTE_PROCESS": self._handle_note_process,
            "DEAL_STAGE_CHECKLIST": self._handle_deal_stage_checklist,
            "ASSET_CLASSIFY": self._handle_asset_classify,
            "MEMORY_EMBED": self._handle_memory_embed,
        }[job_type]

    def _handle_unknown(self, payload: Dict[str, Any]) -> None:
        raise ValueError(f"Unsupported job type: {payload}")

    def _handle_note_process(self, payload: Dict[str, Any]) -> None:
        self._log_action("NOTE_PROCESS", payload)

    def _handle_deal_stage_checklist(self, payload: Dict[str, Any]) -> None:
        self._log_action("DEAL_STAGE_CHECKLIST", payload)

    def _handle_asset_classify(self, payload: Dict[str, Any]) -> None:
        self._log_action("ASSET_CLASSIFY", payload)

    def _handle_memory_embed(self, payload: Dict[str, Any]) -> None:
        self._log_action("MEMORY_EMBED", payload)

    def _log_action(self, job_type: str, payload: Dict[str, Any]) -> None:
        message = json.dumps(payload, sort_keys=True)
        print(f"[{self.worker_id}] Executing {job_type}: {message}")

    def _mark_completed(self, job_id: int) -> None:
        with self._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE jobs
                    SET status = 'completed',
                        completed_at = NOW(),
                        updated_at = NOW(),
                        locked_at = NULL,
                        locked_by = NULL
                    WHERE id = %s
                    """,
                    (job_id,),
                )
                conn.commit()

    def _mark_failed(self, job: Job, error_message: str) -> None:
        next_attempt = job.attempts + 1
        should_retry = next_attempt < job.max_attempts
        backoff_seconds = self._backoff_seconds(next_attempt)
        next_run_at = datetime.now(timezone.utc) + timedelta(seconds=backoff_seconds)
        new_status = "queued" if should_retry else "dead"
        with self._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE jobs
                    SET status = %s,
                        attempts = %s,
                        run_at = %s,
                        last_error = %s,
                        updated_at = NOW(),
                        locked_at = NULL,
                        locked_by = NULL
                    WHERE id = %s
                    """,
                    (
                        new_status,
                        next_attempt,
                        next_run_at,
                        error_message,
                        job.id,
                    ),
                )
                conn.commit()

    def _backoff_seconds(self, attempt: int) -> int:
        jitter = random.randint(0, self.backoff_base_seconds)
        return int(self.backoff_base_seconds * (2 ** (attempt - 1)) + jitter)


def enqueue_job(
    database_url: str,
    job_type: str,
    payload: Dict[str, Any],
    idempotency_key: Optional[str] = None,
    run_at: Optional[datetime] = None,
    max_attempts: int = 8,
) -> int:
    if job_type not in JOB_TYPES:
        raise ValueError(f"Unsupported job type: {job_type}")
    run_at_value = run_at or datetime.now(timezone.utc)
    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO jobs (type, payload, idempotency_key, run_at, max_attempts)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (idempotency_key)
                DO UPDATE SET updated_at = NOW()
                RETURNING id
                """,
                (
                    job_type,
                    json.dumps(payload),
                    idempotency_key,
                    run_at_value,
                    max_attempts,
                ),
            )
            job_id = cursor.fetchone()[0]
            conn.commit()
            return job_id


def load_worker_from_env() -> JobWorker:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    worker_id = os.environ.get("WORKER_ID", f"worker-{random.randint(1000, 9999)}")
    lock_timeout = int(
        os.environ.get("LOCK_TIMEOUT_SECONDS", DEFAULT_LOCK_TIMEOUT_SECONDS)
    )
    poll_interval = int(
        os.environ.get("POLL_INTERVAL_SECONDS", DEFAULT_POLL_INTERVAL_SECONDS)
    )
    backoff_base = int(
        os.environ.get("BACKOFF_BASE_SECONDS", DEFAULT_BACKOFF_BASE_SECONDS)
    )
    return JobWorker(
        database_url=database_url,
        worker_id=worker_id,
        lock_timeout_seconds=lock_timeout,
        poll_interval_seconds=poll_interval,
        backoff_base_seconds=backoff_base,
    )


if __name__ == "__main__":
    worker = load_worker_from_env()
    worker.run_forever()
