import { describe, expect, it } from "vitest";
import { buildIdempotencyKey } from "../src/lib/queue";

describe("queue idempotency", () => {
  it("builds consistent keys", () => {
    expect(buildIdempotencyKey("NOTE_PROCESS", "123")).toBe("note_process-123");
  });
});
