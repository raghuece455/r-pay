import type { ReconcilerMode } from "./types";

export type RetryDecision = {
  shouldRetry: boolean;
  nextDelayMs: number;
  reason: string;
  circuitOpen: boolean;
};

export function calculateRetryDecision(params: {
  mode: ReconcilerMode;
  attempt: number;
  mockLatencyMs: number;
  pendingAgeMs: number;
}): RetryDecision {
  const { mode, attempt, mockLatencyMs, pendingAgeMs } = params;

  if (mode === "buggy") {
    return {
      shouldRetry: true,
      nextDelayMs: 1000,
      reason: "Buggy fixed polling has no jitter, budget, or circuit breaker",
      circuitOpen: false
    };
  }

  const retryBudget = mode === "fixed" ? 6 : 5;
  const circuitOpen = mockLatencyMs >= 4500;

  if (circuitOpen && attempt >= 2) {
    return {
      shouldRetry: false,
      nextDelayMs: 30000,
      reason: "Circuit breaker opened for slow mock UPI switch",
      circuitOpen: true
    };
  }

  if (attempt >= retryBudget || pendingAgeMs > 10 * 60 * 1000) {
    return {
      shouldRetry: false,
      nextDelayMs: 0,
      reason: "Retry budget exhausted; keep payment safely pending",
      circuitOpen
    };
  }

  const baseDelayMs = Math.min(30000, 1000 * 2 ** attempt);
  const jitterMs = mode === "fixed" ? 500 + ((attempt * 137) % 750) : 250 + ((attempt * 83) % 500);

  return {
    shouldRetry: true,
    nextDelayMs: baseDelayMs + jitterMs,
    reason: "Exponential backoff with jitter",
    circuitOpen
  };
}

