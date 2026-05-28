import type { FailureReason, MockSwitchResponse, MockUpiMode } from "./types";

const successMessages = [
  "Mock payment accepted",
  "Mock payer bank confirmed debit",
  "Mock payee bank confirmed credit"
];

const failureReasons: FailureReason[] = [
  "BANK_TIMEOUT",
  "INSUFFICIENT_BALANCE",
  "INVALID_UPI_ID",
  "RATE_LIMITED"
];

function stableNumber(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return hash;
}

export function getMockUpiResponse(mode: MockUpiMode, paymentId: string): MockSwitchResponse {
  const value = stableNumber(`${mode}:${paymentId}`);
  const switchReference = `mock_sw_${value.toString().padStart(5, "0")}`;

  if (mode === "timeout") {
    return {
      status: "PENDING",
      failureReason: "UPI_SWITCH_TIMEOUT",
      latencyMs: 5000 + (value % 1500),
      switchReference,
      message: "Mock UPI switch timeout; reconciliation required"
    };
  }

  if (mode === "slow" || mode === "high_latency") {
    if (value % 5 === 0) {
      return {
        status: "FAILED",
        failureReason: "BANK_TIMEOUT",
        latencyMs: mode === "high_latency" ? 4800 + (value % 700) : 1800 + (value % 900),
        switchReference,
        message: "Mock UPI switch is slow"
      };
    }

    return {
      status: "PENDING",
      latencyMs: mode === "high_latency" ? 4800 + (value % 700) : 1800 + (value % 900),
      switchReference,
      message: "Mock UPI switch is slow"
    };
  }

  if (mode === "partial_failure") {
    if (value % 4 === 0) {
      const failureReason = failureReasons[value % failureReasons.length] ?? "BANK_TIMEOUT";
      return {
        status: "FAILED",
        failureReason,
        latencyMs: 650 + (value % 500),
        switchReference,
        message: `Mock payment failed: ${failureReason}`
      };
    }

    return {
      status: value % 3 === 0 ? "PENDING" : "SUCCESS",
      latencyMs: 420 + (value % 400),
      switchReference,
      message: value % 3 === 0 ? "Mock switch still processing" : successMessages[value % successMessages.length] ?? "Mock payment accepted"
    };
  }

  if (value % 20 === 0) {
    return {
      status: "FAILED",
      failureReason: "INSUFFICIENT_BALANCE",
      latencyMs: 220 + (value % 160),
      switchReference,
      message: "Mock payer bank rejected payment"
    };
  }

  if (value % 8 === 0) {
    return {
      status: "PENDING",
      latencyMs: 260 + (value % 200),
      switchReference,
      message: "Mock switch accepted payment but final status is pending"
    };
  }

  return {
    status: "SUCCESS",
    latencyMs: 180 + (value % 180),
    switchReference,
    message: successMessages[value % successMessages.length] ?? "Mock payment accepted"
  };
}
