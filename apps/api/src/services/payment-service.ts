import {
  assertPaymentTransition,
  createPaymentSchema,
  getMockUpiResponse,
  type CreatePaymentInput,
  type FailureReason,
  type MockUpiMode,
  type PaymentStatus
} from "@rpay/shared";
import { FailureReason as PrismaFailureReason, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http";
import { getDemoUser } from "./demo-data";
import { writeOpsLog, writeTraceSpan } from "./logging-service";

function amountToPaise(amount: number): number {
  return Math.round(amount * 100);
}

function toApiPayment(payment: {
  id: string;
  payerVpa: string;
  payeeVpa: string;
  amountPaise: number;
  currency: string;
  note: string | null;
  status: string;
  failureReason: string | null;
  idempotencyKey: string;
  mockSwitchRef: string | null;
  confirmedByMock: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: payment.id,
    payerVpa: payment.payerVpa,
    payeeVpa: payment.payeeVpa,
    amount: payment.amountPaise / 100,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
    note: payment.note,
    status: payment.status,
    failureReason: payment.failureReason,
    idempotencyKey: payment.idempotencyKey,
    mockSwitchRef: payment.mockSwitchRef,
    confirmedByMock: payment.confirmedByMock,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString()
  };
}

export async function createPayment(input: unknown, idempotencyKey?: string, mockMode?: MockUpiMode) {
  if (!idempotencyKey) {
    throw new HttpError(400, "Idempotency-Key header is required");
  }

  const parsed = createPaymentSchema.parse(input);
  const user = await getDemoUser();

  const existing = await prisma.payment.findUnique({
    where: { userId_idempotencyKey: { userId: user.id, idempotencyKey } },
    include: { attempts: { orderBy: { createdAt: "asc" } }, auditLogs: { orderBy: { createdAt: "asc" } } }
  });

  if (existing) {
    await prisma.auditLog.create({
      data: {
        paymentId: existing.id,
        entityType: "payment",
        entityId: existing.id,
        event: "payment.idempotent_replay",
        actor: "api",
        metadata: { idempotencyKey, reason: "DUPLICATE_REQUEST" } as Prisma.InputJsonValue
      }
    });

    return { payment: toApiPayment(existing), duplicate: true };
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      payerVpa: parsed.payerVpa,
      payeeVpa: parsed.payeeVpa,
      amountPaise: amountToPaise(parsed.amount),
      currency: parsed.currency,
      note: parsed.note,
      idempotencyKey,
      status: "CREATED",
      auditLogs: {
        create: {
          entityType: "payment",
          entityId: "new",
          event: "payment.created",
          actor: "api",
          metadata: { idempotencyKey, payeeVpa: parsed.payeeVpa, amount: parsed.amount } as Prisma.InputJsonValue
        }
      }
    }
  });

  await prisma.auditLog.updateMany({
    where: { paymentId: payment.id, entityId: "new" },
    data: { entityId: payment.id }
  });

  await writeOpsLog({
    service: "payment-api",
    message: "payment.create.request",
    paymentId: payment.id,
    metadata: { idempotencyKey, amountPaise: payment.amountPaise }
  });

  const processed = await processPayment(payment.id, mockMode ?? "normal");
  return { payment: toApiPayment(processed), duplicate: false };
}

export async function transitionPayment(params: {
  paymentId: string;
  to: PaymentStatus;
  actor: string;
  metadata?: Record<string, unknown>;
  failureReason?: FailureReason;
  mockSwitchRef?: string;
  confirmedByMock?: boolean;
}) {
  const payment = await prisma.payment.findUnique({ where: { id: params.paymentId } });
  if (!payment) throw new HttpError(404, "Payment not found");

  const from = payment.status as PaymentStatus;
  assertPaymentTransition(from, params.to);

  if (params.to === "SUCCESS" && !params.confirmedByMock && !payment.confirmedByMock) {
    throw new HttpError(409, "Cannot mark payment SUCCESS without mock UPI confirmation");
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: params.to,
      failureReason: params.failureReason as PrismaFailureReason | undefined,
      mockSwitchRef: params.mockSwitchRef ?? payment.mockSwitchRef,
      confirmedByMock: params.confirmedByMock ?? payment.confirmedByMock,
      auditLogs: {
        create: {
          entityType: "payment",
          entityId: payment.id,
          event: "payment.state_changed",
          actor: params.actor,
          metadata: { from, to: params.to, ...params.metadata } as Prisma.InputJsonValue
        }
      }
    }
  });

  await writeOpsLog({
    service: params.actor,
    message: "payment.state_changed",
    paymentId: payment.id,
    metadata: { from, to: params.to, ...params.metadata }
  });

  return updated;
}

export async function processPayment(paymentId: string, mockMode: MockUpiMode) {
  let payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new HttpError(404, "Payment not found");

  if (payment.status === "CREATED") {
    payment = await transitionPayment({
      paymentId,
      to: "PROCESSING",
      actor: "payment-worker",
      metadata: { reason: "payment job started" }
    });
  }

  if (payment.status !== "PROCESSING" && payment.status !== "PENDING") {
    return payment;
  }

  const traceId = `tr_${payment.id.slice(-8)}_${Date.now()}`;
  const response = getMockUpiResponse(mockMode, payment.id);
  const attemptNo = (await prisma.paymentAttempt.count({ where: { paymentId } })) + 1;

  await prisma.paymentAttempt.create({
    data: {
      paymentId,
      attemptNo,
      status: response.status,
      failureReason: response.failureReason as PrismaFailureReason | undefined,
      latencyMs: response.latencyMs,
      mockSwitchRef: response.switchReference,
      requestJson: {
        paymentId,
        payerVpa: payment.payerVpa,
        payeeVpa: payment.payeeVpa,
        amountPaise: payment.amountPaise,
        currency: payment.currency
      } as Prisma.InputJsonValue,
      responseJson: response as Prisma.InputJsonValue
    }
  });

  await writeTraceSpan({
    traceId,
    spanName: "mock_upi_switch.pay",
    service: "mock-upi-switch",
    durationMs: response.latencyMs,
    status: response.status,
    paymentId,
    metadata: { mockMode, switchReference: response.switchReference }
  });

  await writeOpsLog({
    service: "mock-upi-switch",
    message: "mock_upi_switch.response",
    paymentId,
    traceId,
    metadata: response
  });

  const currentStatus = payment.status as PaymentStatus;
  const nextStatus = response.status as PaymentStatus;

  if (currentStatus === "PENDING" && nextStatus === "PENDING") {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        failureReason: response.failureReason as PrismaFailureReason | undefined,
        mockSwitchRef: response.switchReference,
        auditLogs: {
          create: {
            entityType: "payment",
            entityId: paymentId,
            event: "payment.pending_retry_observed",
            actor: "status-reconciler",
            metadata: { attemptNo, response } as Prisma.InputJsonValue
          }
        }
      }
    });
  }

  return transitionPayment({
    paymentId,
    to: nextStatus,
    actor: "payment-worker",
    failureReason: response.failureReason,
    mockSwitchRef: response.switchReference,
    confirmedByMock: response.status === "SUCCESS",
    metadata: { attemptNo, latencyMs: response.latencyMs, mockMode, message: response.message }
  });
}

export async function getPayment(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { attempts: { orderBy: { createdAt: "asc" } }, auditLogs: { orderBy: { createdAt: "asc" } } }
  });
  if (!payment) throw new HttpError(404, "Payment not found");

  return {
    ...toApiPayment(payment),
    attempts: payment.attempts.map((attempt) => ({
      ...attempt,
      createdAt: attempt.createdAt.toISOString()
    })),
    auditLogs: payment.auditLogs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString() }))
  };
}

export async function listTransactions() {
  const user = await getDemoUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return payments.map(toApiPayment);
}

export async function createMockSwitchPayment(input: CreatePaymentInput) {
  const fakeId = `pay_preview_${Date.now()}`;
  return getMockUpiResponse("normal", `${fakeId}:${input.payeeVpa}:${input.amount}`);
}
