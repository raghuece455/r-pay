import { describe, expect, it } from "vitest";
import { getMockUpiResponse } from "./mock-switch";

describe("mock UPI switch", () => {
  it("returns deterministic normal responses", () => {
    const first = getMockUpiResponse("normal", "pay_123");
    const second = getMockUpiResponse("normal", "pay_123");

    expect(first).toEqual(second);
    expect(["SUCCESS", "FAILED", "PENDING"]).toContain(first.status);
  });

  it("models slow switch behavior", () => {
    const response = getMockUpiResponse("slow", "pay_123");

    expect(response.latencyMs).toBeGreaterThanOrEqual(1800);
    expect(["FAILED", "PENDING"]).toContain(response.status);
  });

  it("models timeout behavior as pending with timeout reason", () => {
    const response = getMockUpiResponse("timeout", "pay_123");

    expect(response.status).toBe("PENDING");
    expect(response.failureReason).toBe("UPI_SWITCH_TIMEOUT");
  });

  it("can produce success, pending, and failure outcomes in mock-only mode", () => {
    const responses = Array.from({ length: 80 }, (_, index) => getMockUpiResponse("normal", `pay_${index}`));
    const statuses = new Set(responses.map((response) => response.status));

    expect(statuses.has("SUCCESS")).toBe(true);
    expect(statuses.has("PENDING")).toBe(true);
    expect(statuses.has("FAILED")).toBe(true);
  });
});
