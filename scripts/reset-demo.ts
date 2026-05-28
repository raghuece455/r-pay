import "dotenv/config";
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "postgresql://rpay:rpay@localhost:5432/rpay?schema=public";

const prisma = new PrismaClient();

async function main() {
  await prisma.rcaDraft.deleteMany();
  await prisma.incidentTimelineEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.traceSpan.deleteMany();
  await prisma.opsLog.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();

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
      deployedBy: "reset-demo",
      summary: "Reset to healthy mock-only baseline",
      mode: "healthy"
    }
  });

  await prisma.opsLog.create({
    data: {
      level: "INFO",
      service: "reset-demo",
      message: "demo.reset",
      metadata: { successRate: 99.2, serviceHealth: "healthy" }
    }
  });

  console.log("R-Pay demo reset to healthy baseline.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
