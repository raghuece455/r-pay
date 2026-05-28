import "dotenv/config";
import { FailureReason as PrismaFailureReason, Prisma, PrismaClient } from "@prisma/client";
import {
  assertPaymentTransition,
  calculateRetryDecision,
  getMockUpiResponse,
  type MockUpiMode,
  type PaymentStatus,
  type ReconcilerMode
} from "@rpay/shared";

process.env.DATABASE_URL ??= "postgresql://rpay:rpay@localhost:5432/rpay?schema=public";

const prisma = new PrismaClient();

const reconcilerMode = (process.env.STATUS_RECONCILER_MODE ?? "healthy") as ReconcilerMode;
const mockUpiMode = (process.env.MOCK_UPI_MODE ?? "normal") as MockUpiMode;

async function writeLog(input: {
  level?: "INFO" | "WARN" | "ERROR";
  service: string;
  message: string;
  paymentId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.opsLog.create({
    data: {
      level: input.level ?? "INFO",
      service: input.service,
      message: input.message,
      paymentId: input.paymentId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
    }
  });
}

async function transitionPayment(
  paymentId: string,
  to: PaymentStatus,
  actor: string,
  metadata: Record<string, unknown> & {
    confirmedByMock?: boolean;
    failureReason?: string;
    mockSwitchRef?: string;
  }
) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  const from = payment.status as PaymentStatus;
  assertPaymentTransition(from, to);

  if (to === "SUCCESS" && metadata.confirmedByMock !== true) {
    throw new Error("Worker cannot mark payment SUCCESS without mock UPI confirmation");
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: to,
      confirmedByMock: to === "SUCCESS" ? true : payment.confirmedByMock,
      failureReason: metadata.failureReason as PrismaFailureReason | undefined,
      mockSwitchRef: metadata.mockSwitchRef ?? payment.mockSwitchRef,
      auditLogs: {
        create: {
          entityType: "payment",
          entityId: paymentId,
          event: "payment.state_changed",
          actor,
          metadata: { from, to, ...metadata }
        }
      }
    }
  });

  await writeLog({ service: actor, message: "payment.state_changed", paymentId, metadata: { from, to, ...metadata } });
}

async function reconcilePayment(payment: {
  id: string;
  payerVpa: string;
  payeeVpa: string;
  amountPaise: number;
  currency: string;
  status: string;
  createdAt: Date;
}) {
  const attemptNo = (await prisma.paymentAttempt.count({ where: { paymentId: payment.id } })) + 1;
  const response = getMockUpiResponse(mockUpiMode, `${payment.id}:reconcile:${attemptNo}`);
  const pendingAgeMs = Date.now() - payment.createdAt.getTime();
  const decision = calculateRetryDecision({
    mode: reconcilerMode,
    attempt: attemptNo,
    mockLatencyMs: response.latencyMs,
    pendingAgeMs
  });

  await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      attemptNo,
      status: response.status,
      failureReason: response.failureReason,
      latencyMs: response.latencyMs,
      mockSwitchRef: response.switchReference,
      requestJson: { paymentId: payment.id, attemptNo, mode: reconcilerMode },
      responseJson: { ...response, retryDecision: decision }
    }
  });

  await writeLog({
    level: decision.circuitOpen || reconcilerMode === "buggy" ? "WARN" : "INFO",
    service: "status-reconciler",
    message: "reconciler.retry",
    paymentId: payment.id,
    metadata: { attemptNo, response, decision }
  });

  if (response.status === "SUCCESS" || response.status === "FAILED") {
    await transitionPayment(payment.id, response.status, "status-reconciler", {
      attemptNo,
      mockSwitchRef: response.switchReference,
      failureReason: response.failureReason,
      confirmedByMock: response.status === "SUCCESS"
    });
    return;
  }

  if (!decision.shouldRetry && payment.status === "PENDING") {
    await transitionPayment(payment.id, "TIMED_OUT", "status-reconciler", {
      attemptNo,
      reason: decision.reason
    });
  }
}

async function tick() {
  const pendingPayments = await prisma.payment.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    orderBy: { createdAt: "asc" },
    take: reconcilerMode === "buggy" ? 100 : 20
  });

  for (const payment of pendingPayments) {
    await reconcilePayment(payment);
  }

  if (pendingPayments.length > 0) {
    await prisma.metricSnapshot.create({
      data: {
        successRate: reconcilerMode === "buggy" ? 91.4 : 99.1,
        failureRate: reconcilerMode === "buggy" ? 4.7 : 0.6,
        pendingCount: pendingPayments.length,
        p95LatencyMs: reconcilerMode === "buggy" ? 4800 : 320,
        queueDepth: reconcilerMode === "buggy" ? pendingPayments.length * 1000 : pendingPayments.length * 40,
        dbPoolUsagePct: reconcilerMode === "buggy" ? 100 : 48,
        mockUpiLatencyMs: mockUpiMode === "slow" ? 5100 : 350,
        retryRate: reconcilerMode === "buggy" ? 16500 : 190,
        serviceHealth: reconcilerMode === "buggy" ? "degraded" : "healthy"
      }
    });
  }
}

console.log(`R-Pay worker started: reconciler=${reconcilerMode}, mockUpi=${mockUpiMode}`);
console.log("Safety: worker uses mock UPI switch only.");

setInterval(() => {
  tick().catch((error) => {
    console.error("Worker tick failed", error);
  });
}, reconcilerMode === "buggy" ? 1000 : 5000);

tick().catch((error) => {
  console.error("Initial worker tick failed", error);
});
