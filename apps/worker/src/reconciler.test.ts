import { describe, expect, it } from "vitest";
import { calculateRetryDecision } from "@rpay/shared";

describe("worker retry modes", () => {
  it("documents the incident-causing buggy retry mode", () => {
    const decision = calculateRetryDecision({
      mode: "buggy",
      attempt: 99,
      mockLatencyMs: 5200,
      pendingAgeMs: 900000
    });

    expect(decision.shouldRetry).toBe(true);
    expect(decision.nextDelayMs).toBe(1000);
  });

  it("documents the fixed retry mode circuit breaker", () => {
    const decision = calculateRetryDecision({
      mode: "fixed",
      attempt: 4,
      mockLatencyMs: 5200,
      pendingAgeMs: 90000
    });

    expect(decision.shouldRetry).toBe(false);
    expect(decision.circuitOpen).toBe(true);
  });
});

