import { describe, expect, it } from "vitest";
import { canSendOutbound } from "../src/lib/permissions";

describe("permissions", () => {
  it("blocks outbound when compliance mode is enabled", () => {
    expect(canSendOutbound({ enabled: true })).toBe(false);
  });
});
