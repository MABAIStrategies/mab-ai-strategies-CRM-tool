CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "MemoryItem"
  ALTER COLUMN embedding TYPE vector USING embedding::vector;

CREATE INDEX IF NOT EXISTS memory_item_embedding_cosine_idx
  ON "MemoryItem"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
