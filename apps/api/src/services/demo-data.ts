import { prisma } from "../lib/prisma";

export async function getDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: "raghu@rpay.local" } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      name: "Raghu",
      email: "raghu@rpay.local",
      vpa: "raghu@rpay",
      bankAccounts: {
        create: {
          bankName: "HDFC Bank",
          maskedNumber: "**** 4242",
          accountType: "Savings",
          balancePaise: 12500000,
          isPrimary: true
        }
      }
    }
  });
}

export async function ensureHealthyMetric() {
  const latest = await prisma.metricSnapshot.findFirst({ orderBy: { createdAt: "desc" } });
  if (latest) return latest;

  return prisma.metricSnapshot.create({
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
}

