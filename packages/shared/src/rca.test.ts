import { describe, expect, it } from "vitest";
import { midnightRetryStormRca, midnightRetryStormSummary } from "./incident-templates";

describe("incident templates", () => {
  it("generates an AI investigation summary from simulated evidence", () => {
    expect(midnightRetryStormSummary()).toContain("retry storm");
    expect(midnightRetryStormSummary()).toContain("91.4%");
  });

  it("generates an RCA draft with safety note", () => {
    expect(midnightRetryStormRca()).toContain("No real UPI APIs");
    expect(midnightRetryStormRca()).toContain("fixed 1-second polling");
  });
});
