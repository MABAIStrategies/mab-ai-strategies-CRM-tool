import { describe, expect, it } from "vitest";
import { structuredExtractSchema } from "../src/lib/extract";

describe("structured extract schema", () => {
  it("validates structured extract", () => {
    const payload = structuredExtractSchema.parse({
      painPoints: ["Manual reporting"],
      suggestedTasks: [{ title: "Send ROI" }]
    });
    expect(payload.painPoints[0]).toBe("Manual reporting");
  });
});
