import { describe, expect, it } from "vitest";
import { calculateRetryDecision } from "./retry";

describe("retry behavior", () => {
  it("shows the buggy fixed polling behavior", () => {
    const decision = calculateRetryDecision({
      mode: "buggy",
      attempt: 20,
      mockLatencyMs: 5000,
      pendingAgeMs: 20 * 60 * 1000
    });

    expect(decision.shouldRetry).toBe(true);
    expect(decision.nextDelayMs).toBe(1000);
    expect(decision.circuitOpen).toBe(false);
  });

  it("opens a circuit in fixed mode when mock UPI is slow", () => {
    const decision = calculateRetryDecision({
      mode: "fixed",
      attempt: 3,
      mockLatencyMs: 5000,
      pendingAgeMs: 60_000
    });

    expect(decision.shouldRetry).toBe(false);
    expect(decision.circuitOpen).toBe(true);
  });

  it("uses backoff and jitter in healthy mode", () => {
    const decision = calculateRetryDecision({
      mode: "healthy",
      attempt: 2,
      mockLatencyMs: 300,
      pendingAgeMs: 30_000
    });

    expect(decision.shouldRetry).toBe(true);
    expect(decision.nextDelayMs).toBeGreaterThan(4000);
    expect(decision.nextDelayMs).toBeLessThan(5000);
  });
});

