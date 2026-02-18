import json
import logging
import os
import random
import signal
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
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
DEFAULT_JOB_TIMEOUT_SECONDS = 120

logger = logging.getLogger("job_worker")


@dataclass
class PayloadRule:
    required: set[str]
    optional: set[str]
    field_types: Dict[str, type]


PAYLOAD_RULES: Dict[str, PayloadRule] = {
    "NOTE_PROCESS": PayloadRule(
        required={"note_id"},
        optional={"text", "source"},
        field_types={"note_id": str, "text": str, "source": str},
    ),
    "DEAL_STAGE_CHECKLIST": PayloadRule(
        required={"deal_id", "stage"},
        optional={"owner_id", "metadata"},
        field_types={
            "deal_id": str,
            "stage": str,
            "owner_id": str,
            "metadata": dict,
        },
    ),
    "ASSET_CLASSIFY": PayloadRule(
        required={"asset_id"},
        optional={"content", "mime_type"},
        field_types={"asset_id": str, "content": str, "mime_type": str},
    ),
    "MEMORY_EMBED": PayloadRule(
        required={"memory_id", "text"},
        optional={"entity_id", "entity_type"},
        field_types={
            "memory_id": str,
            "text": str,
            "entity_id": str,
            "entity_type": str,
        },
    ),
}


@dataclass
class Job:
    id: int
    type: str
    payload: Dict[str, Any]
    attempts: int
    max_attempts: int
    timeout_seconds: int


class JobWorker:
    def __init__(
        self,
        database_url: str,
        worker_id: str,
        lock_timeout_seconds: int = DEFAULT_LOCK_TIMEOUT_SECONDS,
        poll_interval_seconds: int = DEFAULT_POLL_INTERVAL_SECONDS,
        backoff_base_seconds: int = DEFAULT_BACKOFF_BASE_SECONDS,
        default_job_timeout_seconds: int = DEFAULT_JOB_TIMEOUT_SECONDS,
        dead_letter_handler: Optional[
            Callable[[Job, str, datetime], None]
        ] = None,
    ) -> None:
        self.database_url = database_url
        self.worker_id = worker_id
        self.lock_timeout_seconds = lock_timeout_seconds
        self.poll_interval_seconds = poll_interval_seconds
        self.backoff_base_seconds = backoff_base_seconds
        self.default_job_timeout_seconds = default_job_timeout_seconds
        self.dead_letter_handler = dead_letter_handler
        self._shutdown_requested = False
        self._register_signal_handlers()

        self.handler_registry: Dict[str, Callable[[Dict[str, Any]], None]] = {
            "NOTE_PROCESS": self._handle_note_process,
            "DEAL_STAGE_CHECKLIST": self._handle_deal_stage_checklist,
            "ASSET_CLASSIFY": self._handle_asset_classify,
            "MEMORY_EMBED": self._handle_memory_embed,
        }

    def run_forever(self) -> None:
        logger.info("Worker %s started", self.worker_id)
        while not self._shutdown_requested:
            try:
                job = self._lock_next_job()
            except Exception:  # noqa: BLE001
                logger.exception("Worker %s failed while polling for a job", self.worker_id)
                time.sleep(self.poll_interval_seconds)
                continue

            if not job:
                time.sleep(self.poll_interval_seconds)
                continue
            self._process_job(job)

        logger.info("Worker %s exiting gracefully", self.worker_id)

    def _register_signal_handlers(self) -> None:
        signal.signal(signal.SIGTERM, self._request_shutdown)
        signal.signal(signal.SIGINT, self._request_shutdown)

    def _request_shutdown(self, signum: int, _frame: Any) -> None:
        self._shutdown_requested = True
        logger.info("Worker %s received signal %s and will shutdown", self.worker_id, signum)

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
                if not isinstance(payload, dict):
                    payload = {"value": payload}

                timeout_seconds = row.get("timeout_seconds") or self.default_job_timeout_seconds

                logger.info(
                    "Worker %s locked job id=%s type=%s attempt=%s",
                    self.worker_id,
                    row["id"],
                    row["type"],
                    row["attempts"] + 1,
                )
                return Job(
                    id=row["id"],
                    type=row["type"],
                    payload=payload,
                    attempts=row["attempts"],
                    max_attempts=row["max_attempts"],
                    timeout_seconds=timeout_seconds,
                )

    def _process_job(self, job: Job) -> None:
        handler = self._handler_for(job.type)
        logger.info(
            "Worker %s processing job id=%s type=%s timeout=%ss",
            self.worker_id,
            job.id,
            job.type,
            job.timeout_seconds,
        )

        try:
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(handler, job.payload)
                future.result(timeout=job.timeout_seconds)

            self._mark_completed(job.id)
            logger.info("Worker %s completed job id=%s", self.worker_id, job.id)
        except FuturesTimeoutError:
            timeout_message = (
                f"Job id={job.id} type={job.type} exceeded timeout of "
                f"{job.timeout_seconds}s"
            )
            logger.warning(timeout_message)
            self._mark_failed(job, timeout_message)
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Worker %s failed job id=%s type=%s",
                self.worker_id,
                job.id,
                job.type,
            )
            self._mark_failed(job, str(exc))

    def _handler_for(self, job_type: str) -> Callable[[Dict[str, Any]], None]:
        return self.handler_registry.get(job_type, self._handle_unknown)

    def _handle_unknown(self, payload: Dict[str, Any]) -> None:
        raise ValueError(f"Unsupported job type payload={payload}")

    def _handle_note_process(self, payload: Dict[str, Any]) -> None:
        self._log_action("NOTE_PROCESS", payload)

    def _handle_deal_stage_checklist(self, payload: Dict[str, Any]) -> None:
        self._log_action("DEAL_STAGE_CHECKLIST", payload)

    def _handle_asset_classify(self, payload: Dict[str, Any]) -> None:
        self._log_action("ASSET_CLASSIFY", payload)

    def _handle_memory_embed(self, payload: Dict[str, Any]) -> None:
        self._log_action("MEMORY_EMBED", payload)

    def _log_action(self, job_type: str, payload: Dict[str, Any]) -> None:
        logger.info(
            "[%s] Executing %s payload=%s",
            self.worker_id,
            job_type,
            json.dumps(payload, sort_keys=True),
        )

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

        if new_status == "dead" and self.dead_letter_handler:
            self.dead_letter_handler(job, error_message, next_run_at)

        logger.info(
            "Worker %s updated failed job id=%s status=%s attempt=%s next_run_at=%s",
            self.worker_id,
            job.id,
            new_status,
            next_attempt,
            next_run_at.isoformat(),
        )

    def _backoff_seconds(self, attempt: int) -> int:
        jitter = random.randint(0, self.backoff_base_seconds)
        return int(self.backoff_base_seconds * (2 ** (attempt - 1)) + jitter)


def _validate_payload_for_job_type(job_type: str, payload: Dict[str, Any]) -> None:
    rule = PAYLOAD_RULES[job_type]
    missing = rule.required - payload.keys()
    if missing:
        raise ValueError(
            f"Missing required payload keys for {job_type}: {', '.join(sorted(missing))}"
        )

    extra = payload.keys() - rule.required - rule.optional
    if extra:
        raise ValueError(
            f"Unexpected payload keys for {job_type}: {', '.join(sorted(extra))}"
        )

    for field_name, expected_type in rule.field_types.items():
        if field_name in payload and not isinstance(payload[field_name], expected_type):
            raise ValueError(
                f"Invalid payload field type for {field_name}: expected {expected_type.__name__}"
            )


def _validate_job_input(
    job_type: str,
    payload: Dict[str, Any],
    idempotency_key: Optional[str],
    max_attempts: int,
    timeout_seconds: int,
) -> None:
    if job_type not in JOB_TYPES:
        raise ValueError(f"Unsupported job type: {job_type}")
    if not isinstance(payload, dict):
        raise ValueError("payload must be a JSON object")
    if max_attempts <= 0:
        raise ValueError("max_attempts must be > 0")
    if timeout_seconds <= 0:
        raise ValueError("timeout_seconds must be > 0")
    if idempotency_key is not None and not idempotency_key.strip():
        raise ValueError("idempotency_key cannot be empty when provided")

    _validate_payload_for_job_type(job_type, payload)


def enqueue_job(
    database_url: str,
    job_type: str,
    payload: Dict[str, Any],
    idempotency_key: Optional[str] = None,
    run_at: Optional[datetime] = None,
    max_attempts: int = 8,
    timeout_seconds: int = DEFAULT_JOB_TIMEOUT_SECONDS,
) -> int:
    _validate_job_input(
        job_type=job_type,
        payload=payload,
        idempotency_key=idempotency_key,
        max_attempts=max_attempts,
        timeout_seconds=timeout_seconds,
    )
    run_at_value = run_at or datetime.now(timezone.utc)

    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO jobs (
                    type,
                    payload,
                    idempotency_key,
                    run_at,
                    max_attempts,
                    timeout_seconds
                )
                VALUES (%s, %s, %s, %s, %s, %s)
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
                    timeout_seconds,
                ),
            )
            job_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(
                "Enqueued job id=%s type=%s idempotency_key=%s",
                job_id,
                job_type,
                idempotency_key,
            )
            return job_id


def _default_dead_letter_handler(job: Job, error: str, next_run_at: datetime) -> None:
    logger.error(
        "DEAD LETTER: job id=%s type=%s attempts=%s/%s error=%s next_run_at=%s",
        job.id,
        job.type,
        job.attempts + 1,
        job.max_attempts,
        error,
        next_run_at.isoformat(),
    )


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
    default_timeout = int(
        os.environ.get("DEFAULT_JOB_TIMEOUT_SECONDS", DEFAULT_JOB_TIMEOUT_SECONDS)
    )

    return JobWorker(
        database_url=database_url,
        worker_id=worker_id,
        lock_timeout_seconds=lock_timeout,
        poll_interval_seconds=poll_interval,
        backoff_base_seconds=backoff_base,
        default_job_timeout_seconds=default_timeout,
        dead_letter_handler=_default_dead_letter_handler,
    )


def configure_logging() -> None:
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


if __name__ == "__main__":
    configure_logging()
    worker = load_worker_from_env()
    worker.run_forever()
