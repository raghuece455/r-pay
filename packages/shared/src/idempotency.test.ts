import { describe, expect, it } from "vitest";

type PaymentRecord = {
  id: string;
  userId: string;
  idempotencyKey: string;
};

function createPaymentInMemory(store: PaymentRecord[], userId: string, idempotencyKey: string) {
  const existing = store.find((payment) => payment.userId === userId && payment.idempotencyKey === idempotencyKey);
  if (existing) return { payment: existing, duplicate: true };

  const payment = { id: `pay_${store.length + 1}`, userId, idempotencyKey };
  store.push(payment);
  return { payment, duplicate: false };
}

describe("idempotency", () => {
  it("does not create a duplicate payment for the same user and idempotency key", () => {
    const store: PaymentRecord[] = [];
    const first = createPaymentInMemory(store, "user_1", "key_1");
    const second = createPaymentInMemory(store, "user_1", "key_1");

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.payment.id).toBe(first.payment.id);
    expect(store).toHaveLength(1);
  });

  it("keeps idempotency scoped to a user", () => {
    const store: PaymentRecord[] = [];
    createPaymentInMemory(store, "user_1", "shared_key");
    createPaymentInMemory(store, "user_2", "shared_key");

    expect(store).toHaveLength(2);
  });
});

