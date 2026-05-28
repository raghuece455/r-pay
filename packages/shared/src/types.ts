export const paymentStatuses = [
  "CREATED",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "PENDING",
  "TIMED_OUT",
  "RECONCILED"
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export const failureReasons = [
  "UPI_SWITCH_TIMEOUT",
  "BANK_TIMEOUT",
  "INSUFFICIENT_BALANCE",
  "INVALID_UPI_ID",
  "DUPLICATE_REQUEST",
  "RECONCILIATION_REQUIRED",
  "RATE_LIMITED"
] as const;

export type FailureReason = (typeof failureReasons)[number];

export type MockUpiMode = "normal" | "slow" | "timeout" | "partial_failure" | "high_latency";

export type ReconcilerMode = "healthy" | "buggy" | "fixed";

export type Payment = {
  id: string;
  payerVpa: string;
  payeeVpa: string;
  amountPaise: number;
  currency: "INR";
  note?: string | null;
  status: PaymentStatus;
  failureReason?: FailureReason | null;
  idempotencyKey: string;
  mockSwitchRef?: string | null;
  confirmedByMock: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MetricSnapshot = {
  successRate: number;
  failureRate: number;
  pendingCount: number;
  p95LatencyMs: number;
  queueDepth: number;
  dbPoolUsagePct: number;
  mockUpiLatencyMs: number;
  retryRate: number;
  serviceHealth: "healthy" | "degraded" | "recovering";
  createdAt: string;
};

export type MockSwitchResponse = {
  status: Extract<PaymentStatus, "SUCCESS" | "FAILED" | "PENDING">;
  failureReason?: FailureReason;
  latencyMs: number;
  switchReference: string;
  message: string;
};

