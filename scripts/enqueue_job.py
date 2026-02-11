import os

from worker.job_worker import enqueue_job


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    job_id = enqueue_job(
        database_url=database_url,
        job_type="NOTE_PROCESS",
        payload={"note_id": "demo-123", "text": "Sample note"},
        idempotency_key="note-demo-123",
    )
    print(f"Enqueued job {job_id}")


if __name__ == "__main__":
    main()
