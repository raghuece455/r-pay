import {
  midnightRetryStormRca,
  midnightRetryStormSummary,
  type ReconcilerMode
} from "@rpay/shared";
import { prisma } from "../lib/prisma";
import { ensureHealthyMetric } from "./demo-data";
import { writeOpsLog, writeTraceSpan } from "./logging-service";

const stormIncidentKey = "INC-2026-0528-001";

export async function latestMetrics() {
  await ensureHealthyMetric();
  const latest = await prisma.metricSnapshot.findFirst({ orderBy: { createdAt: "desc" } });
  return latest;
}

export async function listIncidents() {
  return prisma.incident.findMany({
    orderBy: { startedAt: "desc" },
    include: { timeline: { orderBy: { createdAt: "asc" } } }
  });
}

export async function getIncident(id: string) {
  return prisma.incident.findFirstOrThrow({
    where: { OR: [{ id }, { incidentKey: id }] },
    include: {
      timeline: { orderBy: { createdAt: "asc" } },
      rcaDrafts: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function createIncident(input: {
  title: string;
  severity?: "SEV1" | "SEV2" | "SEV3";
  service?: string;
  summary?: string;
}) {
  const incidentKey = `INC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()
    .toString()
    .slice(-3)}`;

  return prisma.incident.create({
    data: {
      incidentKey,
      title: input.title,
      severity: input.severity ?? "SEV2",
      status: "INVESTIGATING",
      service: input.service ?? "payment-service",
      summary: input.summary ?? input.title,
      timeline: {
        create: {
          actor: "incidentdesk",
          eventType: "incident.created",
          message: "Incident created from IncidentDesk"
        }
      }
    },
    include: { timeline: true }
  });
}

export async function addTimelineEvent(
  incidentId: string,
  input: { actor: string; eventType: string; message: string }
) {
  const incident = await getIncident(incidentId);
  return prisma.incidentTimelineEvent.create({
    data: {
      incidentId: incident.id,
      actor: input.actor,
      eventType: input.eventType,
      message: input.message
    }
  });
}

export async function listDeployments() {
  return prisma.deployment.findMany({ orderBy: { deployedAt: "desc" }, take: 20 });
}

export async function listLogs() {
  return prisma.opsLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
}

export async function listTraces() {
  return prisma.traceSpan.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function listRunbooks() {
  return prisma.runbook.findMany({ orderBy: { title: "asc" } });
}

export async function simulateNormalTraffic() {
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

  await writeOpsLog({
    service: "payment-api",
    message: "normal_traffic.sample",
    metadata: { successRate: 99.2, p95LatencyMs: 280 }
  });

  return latestMetrics();
}

export async function simulateMidnightRetryStorm() {
  await prisma.deployment.create({
    data: {
      version: "rpay-worker-2026.05.28-001",
      service: "status-reconciler",
      status: "DEPLOYED",
      deployedBy: "release-manager",
      summary: "Changed status reconciler retry polling",
      mode: "buggy"
    }
  });

  await prisma.metricSnapshot.create({
    data: {
      successRate: 91.4,
      failureRate: 4.7,
      pendingCount: 3296,
      p95LatencyMs: 4800,
      queueDepth: 98200,
      dbPoolUsagePct: 100,
      mockUpiLatencyMs: 5100,
      retryRate: 16500,
      serviceHealth: "degraded"
    }
  });

  const incident = await prisma.incident.upsert({
    where: { incidentKey: stormIncidentKey },
    update: {
      status: "INVESTIGATING",
      severity: "SEV1",
      investigationSummary: midnightRetryStormSummary(),
      rootCause:
        "A bad reconciler release replaced exponential backoff and jitter with fixed 1-second polling while the UPI switch simulator was slow.",
      resolvedAt: null
    },
    create: {
      incidentKey: stormIncidentKey,
      title: "The Midnight Retry Storm",
      severity: "SEV1",
      status: "INVESTIGATING",
      service: "payment-service",
      summary:
        "Payment success rate dropped, latency spiked, pending payments rose 8x, and the status reconciler queue depth exploded.",
      investigationSummary: midnightRetryStormSummary(),
      rootCause:
        "A bad reconciler release replaced exponential backoff and jitter with fixed 1-second polling while the UPI switch simulator was slow."
    }
  });

  const timeline = [
    ["pagerduty", "alert.fired", "SEV1 alert: payment success rate dropped from 99.2% to 91.4%."],
    ["cloudwatch", "metric.spike", "P95 latency jumped from 280 ms to 4.8 seconds."],
    ["incident-commander", "incident.declared", "Incident declared. Start read-only investigation."],
    ["log-analyst", "finding", "Reconciler retry attempts increased sharply after latest worker deployment."],
    ["trace-analyst", "finding", "UPI switch simulator spans show high latency; DB writes queue behind reconciler retries."],
    ["reliability-engineer", "finding", "DB pool is at 100%; queue depth is 98,200; retry rate is 16,500/min."]
  ] as const;

  for (const [actor, eventType, message] of timeline) {
    await prisma.incidentTimelineEvent.create({
      data: { incidentId: incident.id, actor, eventType, message }
    });
  }

  const traceId = `storm_${Date.now()}`;
  await writeOpsLog({
    level: "WARN",
    service: "status-reconciler",
    message: "retry_storm.detected",
    incidentId: incident.id,
    traceId,
    metadata: {
      reconcilerMode: "buggy" satisfies ReconcilerMode,
      retryDelayMs: 1000,
      jitter: false,
      retryBudget: false,
      circuitBreaker: false
    }
  });

  await writeTraceSpan({
    traceId,
    spanName: "status_reconciler.retry_loop",
    service: "status-reconciler",
    durationMs: 4820,
    status: "ERROR",
    metadata: { queueDepth: 98200, dbPoolUsagePct: 100 }
  });

  return getIncident(incident.id);
}

export async function recoverFromIncident() {
  const incident = await prisma.incident.findUnique({ where: { incidentKey: stormIncidentKey } });

  await prisma.deployment.create({
    data: {
      version: "rpay-worker-2026.05.28-002",
      service: "status-reconciler",
      status: "DEPLOYED",
      deployedBy: "human-approved-release-manager",
      summary: "Restored exponential backoff, jitter, retry budget, and circuit breaker",
      mode: "fixed"
    }
  });

  await prisma.metricSnapshot.create({
    data: {
      successRate: 99.1,
      failureRate: 0.6,
      pendingCount: 510,
      p95LatencyMs: 320,
      queueDepth: 1800,
      dbPoolUsagePct: 48,
      mockUpiLatencyMs: 350,
      retryRate: 190,
      serviceHealth: "recovering"
    }
  });

  if (incident) {
    await prisma.incidentTimelineEvent.createMany({
      data: [
        {
          incidentId: incident.id,
          actor: "release-manager",
          eventType: "approval.recorded",
          message: "Human approval recorded for rollback and fixed retry deployment."
        },
        {
          incidentId: incident.id,
          actor: "reliability-engineer",
          eventType: "recovery.observed",
          message: "Metrics recovered: queue depth falling, DB pool under 50%, payment API healthy."
        }
      ]
    });

    await prisma.incident.update({
      where: { id: incident.id },
      data: { status: "MONITORING", resolvedAt: new Date() }
    });

    return getIncident(incident.id);
  }

  return latestMetrics();
}

export async function generateRca(incidentId?: string) {
  const incident = incidentId
    ? await getIncident(incidentId)
    : await prisma.incident.findUniqueOrThrow({ where: { incidentKey: stormIncidentKey } });

  return prisma.rcaDraft.create({
    data: {
      incidentId: incident.id,
      title: "RCA Draft: Midnight Retry Storm",
      body: midnightRetryStormRca()
    }
  });
}
