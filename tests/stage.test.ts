import { describe, expect, it } from "vitest";
import { getChecklistForStage } from "../src/lib/stage";

describe("stage checklist", () => {
  it("returns checklist items for discovery completed", () => {
    const checklist = getChecklistForStage("DISCOVERY_COMPLETED");
    expect(checklist.length).toBeGreaterThan(0);
  });
});
