import sys
import types
import unittest

psycopg2_stub = types.ModuleType("psycopg2")
psycopg2_extras_stub = types.ModuleType("psycopg2.extras")
psycopg2_extras_stub.RealDictCursor = object
psycopg2_stub.extras = psycopg2_extras_stub
sys.modules.setdefault("psycopg2", psycopg2_stub)
sys.modules.setdefault("psycopg2.extras", psycopg2_extras_stub)

from worker.job_worker import JobWorker, _validate_job_input


class JobWorkerUnitTests(unittest.TestCase):
    def test_validate_job_input_accepts_valid(self):
        _validate_job_input(
            job_type="NOTE_PROCESS",
            payload={"note_id": "123", "text": "hello"},
            idempotency_key="note-123",
            max_attempts=3,
            timeout_seconds=30,
        )

    def test_validate_job_input_rejects_invalid(self):
        with self.assertRaises(ValueError):
            _validate_job_input(
                job_type="UNKNOWN",
                payload={"x": 1},
                idempotency_key=None,
                max_attempts=3,
                timeout_seconds=30,
            )

        with self.assertRaises(ValueError):
            _validate_job_input(
                job_type="NOTE_PROCESS",
                payload={"note_id": "123", "extra": "nope"},
                idempotency_key="",
                max_attempts=3,
                timeout_seconds=30,
            )

        with self.assertRaises(ValueError):
            _validate_job_input(
                job_type="NOTE_PROCESS",
                payload={"note_id": "123", "text": "ok"},
                idempotency_key=None,
                max_attempts=0,
                timeout_seconds=30,
            )

        with self.assertRaises(ValueError):
            _validate_job_input(
                job_type="MEMORY_EMBED",
                payload={"memory_id": "m1", "text": 123},
                idempotency_key=None,
                max_attempts=1,
                timeout_seconds=30,
            )

    def test_backoff_increases_with_attempt(self):
        worker = JobWorker(
            database_url="postgres://example",
            worker_id="worker-test",
            backoff_base_seconds=5,
        )

        self.assertGreaterEqual(worker._backoff_seconds(2), 10)
        self.assertGreaterEqual(worker._backoff_seconds(3), 20)


if __name__ == "__main__":
    unittest.main()
