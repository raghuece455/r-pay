import { describe, expect, it } from "vitest";
import { assertPaymentTransition, canTransitionPayment } from "./state-machine";

describe("payment state machine", () => {
  it("allows the normal success path", () => {
    expect(canTransitionPayment("CREATED", "PROCESSING")).toBe(true);
    expect(canTransitionPayment("PROCESSING", "SUCCESS")).toBe(true);
    expect(canTransitionPayment("SUCCESS", "RECONCILED")).toBe(true);
  });

  it("allows pending reconciliation paths", () => {
    expect(canTransitionPayment("PROCESSING", "PENDING")).toBe(true);
    expect(canTransitionPayment("PENDING", "SUCCESS")).toBe(true);
    expect(canTransitionPayment("PENDING", "FAILED")).toBe(true);
    expect(canTransitionPayment("PENDING", "TIMED_OUT")).toBe(true);
  });

  it("rejects unsafe transitions", () => {
    expect(canTransitionPayment("FAILED", "SUCCESS")).toBe(false);
    expect(() => assertPaymentTransition("RECONCILED", "SUCCESS")).toThrow("Invalid payment transition");
  });
});

