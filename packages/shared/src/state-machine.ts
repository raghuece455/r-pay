import type { PaymentStatus } from "./types";

export const allowedPaymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  CREATED: ["PROCESSING"],
  PROCESSING: ["SUCCESS", "FAILED", "PENDING"],
  SUCCESS: ["RECONCILED"],
  FAILED: ["RECONCILED"],
  PENDING: ["SUCCESS", "FAILED", "TIMED_OUT"],
  TIMED_OUT: ["RECONCILED"],
  RECONCILED: []
};

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return allowedPaymentTransitions[from].includes(to);
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment transition: ${from} -> ${to}`);
  }
}

export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return status === "SUCCESS" || status === "FAILED" || status === "TIMED_OUT" || status === "RECONCILED";
}

