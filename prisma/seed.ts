import "dotenv/config";
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "postgresql://rpay:rpay@localhost:5432/rpay?schema=public";

const prisma = new PrismaClient();

const runbookBody = `# Payment Incident Runbook

## First Five Minutes

1. Declare the incident.
2. Start read-only investigation.
3. Check success rate, p95 latency, pending count, queue depth, DB pool usage, and payment network latency.
4. Check recent deployments.
5. Preserve payment creation if safe.
6. Do not mark payments SUCCESS without payment network confirmation.
7. Do not delete audit logs.

## Midnight Retry Storm Mitigation

- Disable aggressive status polling.
- Roll back the status reconciler worker.
- Increase status check interval temporarily.
- Pause non-critical reconciliation jobs.
- Keep payment creation API running.

## Permanent Fix

- Restore exponential backoff and jitter.
- Add retry budget.
- Add circuit breaker for slow UPI switch simulator.
- Add alerts for retry rate, queue depth, pending age, and DB pool saturation.
`;

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "raghu@rpay.local" },
    update: {},
    create: {
      name: "Raghu",
      email: "raghu@rpay.local",
      vpa: "raghu@rpay"
    }
  });

  await prisma.bankAccount.upsert({
    where: { id: "demo-account-primary" },
    update: {
      userId: user.id,
      balancePaise: 12500000
    },
    create: {
      id: "demo-account-primary",
      userId: user.id,
      bankName: "HDFC Bank",
      maskedNumber: "**** 4242",
      accountType: "Savings",
      balancePaise: 12500000,
      isPrimary: true
    }
  });

  await prisma.metricSnapshot.create({
    data: {
      successRate: 99.2,
      failureRate: 0.5,
      pendingCount: 412,
      p95LatencyMs: 280,
      queueDepth: 1200,
      dbPoolUsagePct: 42,
      mockUpiLatencyMs: 310,
      retryRate: 140,
      serviceHealth: "healthy"
    }
  });

  await prisma.deployment.create({
    data: {
      version: "rpay-api-2026.05.28-000",
      service: "payment-api",
      status: "DEPLOYED",
      deployedBy: "demo-seed",
      summary: "Baseline healthy sandbox R-Pay deployment",
      mode: "healthy"
    }
  });

  await prisma.runbook.upsert({
    where: { slug: "payment-incident-runbook" },
    update: { title: "Payment Incident Runbook", body: runbookBody },
    create: {
      slug: "payment-incident-runbook",
      title: "Payment Incident Runbook",
      body: runbookBody
    }
  });

  await prisma.opsLog.createMany({
    data: [
      {
        level: "INFO",
        service: "payment-api",
        message: "seed.normal_health",
        metadata: { successRate: 99.2, mockOnly: true }
      },
      {
        level: "INFO",
        service: "status-reconciler",
        message: "seed.reconciler_healthy",
        metadata: { mode: "healthy", backoff: true, jitter: true }
      }
    ]
  });

  console.log("Seeded R-Pay demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
