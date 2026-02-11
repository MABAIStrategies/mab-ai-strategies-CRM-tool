import os
import unittest
from pathlib import Path

try:
    import psycopg2
except ModuleNotFoundError:  # pragma: no cover - environment dependent
    psycopg2 = None

if psycopg2:
    from worker.job_worker import JobWorker, enqueue_job


def _load_schema_sql() -> str:
    schema_path = Path(__file__).resolve().parents[1] / "db" / "schema.sql"
    return schema_path.read_text()


@unittest.skipUnless(psycopg2 is not None, "psycopg2 is required for integration tests")
@unittest.skipUnless(
    os.environ.get("TEST_DATABASE_URL"),
    "TEST_DATABASE_URL not set for Postgres integration tests",
)
class JobWorkerIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.database_url = os.environ["TEST_DATABASE_URL"]

    def setUp(self):
        with psycopg2.connect(self.database_url) as conn:
            with conn.cursor() as cursor:
                cursor.execute("DROP TABLE IF EXISTS jobs")
                cursor.execute("DROP TYPE IF EXISTS job_status")
                cursor.execute("DROP TYPE IF EXISTS job_type")
                cursor.execute(_load_schema_sql())
                conn.commit()

    def _fetch_job_count(self):
        with psycopg2.connect(self.database_url) as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT count(*) FROM jobs")
                return cursor.fetchone()[0]

    def test_enqueue_idempotency_returns_same_row(self):
        first_id = enqueue_job(
            database_url=self.database_url,
            job_type="NOTE_PROCESS",
            payload={"note_id": "n-1", "text": "hello"},
            idempotency_key="note-n-1",
        )
        second_id = enqueue_job(
            database_url=self.database_url,
            job_type="NOTE_PROCESS",
            payload={"note_id": "n-1", "text": "hello"},
            idempotency_key="note-n-1",
        )

        self.assertEqual(first_id, second_id)
        self.assertEqual(self._fetch_job_count(), 1)

    def test_concurrent_workers_lock_distinct_rows(self):
        enqueue_job(
            database_url=self.database_url,
            job_type="NOTE_PROCESS",
            payload={"note_id": "n-1", "text": "a"},
            idempotency_key="note-n-1",
        )
        enqueue_job(
            database_url=self.database_url,
            job_type="NOTE_PROCESS",
            payload={"note_id": "n-2", "text": "b"},
            idempotency_key="note-n-2",
        )

        worker_a = JobWorker(database_url=self.database_url, worker_id="worker-a")
        worker_b = JobWorker(database_url=self.database_url, worker_id="worker-b")

        job_a = worker_a._lock_next_job()
        job_b = worker_b._lock_next_job()

        self.assertIsNotNone(job_a)
        self.assertIsNotNone(job_b)
        self.assertNotEqual(job_a.id, job_b.id)

        with psycopg2.connect(self.database_url) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT count(*) FROM jobs WHERE status = 'processing' AND locked_by IN ('worker-a', 'worker-b')"
                )
                processing_count = cursor.fetchone()[0]

        self.assertEqual(processing_count, 2)


if __name__ == "__main__":
    unittest.main()
