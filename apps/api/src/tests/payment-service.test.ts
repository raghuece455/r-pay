import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma";
import { createPayment } from "../services/payment-service";

const maybeDescribe = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

maybeDescribe("payment API service", () => {
  beforeEach(async () => {
    await prisma.paymentAttempt.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.payment.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("requires idempotency and prevents duplicate payment creation", async () => {
    const body = {
      payerVpa: "raghu@rpay",
      payeeVpa: "chai-shop@rpay",
      amount: 150,
      currency: "INR",
      note: "test duplicate"
    };

    const first = await createPayment(body, "test-duplicate-key", "normal");
    const second = await createPayment(body, "test-duplicate-key", "normal");
    const count = await prisma.payment.count();

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.payment.id).toBe(first.payment.id);
    expect(count).toBe(1);
  });

  it("creates audit logs for payment creation and state changes", async () => {
    const result = await createPayment(
      {
        payerVpa: "raghu@rpay",
        payeeVpa: "fresh-mart@rpay",
        amount: 780,
        currency: "INR",
        note: "audit test"
      },
      "test-audit-key",
      "normal"
    );

    const auditLogCount = await prisma.auditLog.count({ where: { paymentId: result.payment.id } });

    expect(auditLogCount).toBeGreaterThanOrEqual(2);
    expect(["SUCCESS", "FAILED", "PENDING"]).toContain(result.payment.status);
  });
});
