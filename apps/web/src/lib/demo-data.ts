import type { Incident, MetricSnapshot, Payment } from "./api";

export const recentContacts = [
  { name: "Asha", vpa: "asha@rpay", tone: "aqua" as const },
  { name: "Vikram", vpa: "vikram@rpay", tone: "indigo" as const },
  { name: "Meera", vpa: "meera@rpay", tone: "plum" as const },
  { name: "Kiran", vpa: "kiran@rpay", tone: "amber" as const }
];

export const recentMerchants = [
  { name: "Chai Shop", vpa: "chai-shop@rpay", category: "Food" },
  { name: "Fresh Mart", vpa: "fresh-mart@rpay", category: "Groceries" },
  { name: "Metro Books", vpa: "book-store@rpay", category: "Books" }
];

export function groupPaymentsByDate(payments: Payment[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  const groups = new Map<string, Payment[]>();

  for (const payment of payments) {
    const date = new Date(payment.createdAt).toDateString();
    const label = date === today ? "Today" : date === yesterday ? "Yesterday" : "Earlier";
    groups.set(label, [...(groups.get(label) ?? []), payment]);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export function hasPendingPayment(payments: Payment[]) {
  return payments.some((payment) => payment.status === "PENDING" || payment.status === "PROCESSING");
}

export function metricSeries(metrics: MetricSnapshot) {
  const incidentLike = metrics.successRate < 95 || metrics.dbPoolUsagePct > 80 || metrics.queueDepth > 10000;

  return {
    successRate: incidentLike ? [99.2, 98.8, 96.4, 91.4, 94.8, metrics.successRate] : [98.9, 99.0, 99.1, 99.2, 99.1, metrics.successRate],
    latency: incidentLike ? [280, 410, 1200, 4800, 1900, metrics.p95LatencyMs] : [260, 290, 275, 305, 320, metrics.p95LatencyMs],
    queueDepth: incidentLike ? [120, 900, 6200, 14400, 6200, metrics.queueDepth] : [920, 1100, 1200, 1500, 1800, metrics.queueDepth],
    dbPool: incidentLike ? [42, 55, 78, 100, 78, metrics.dbPoolUsagePct] : [38, 42, 45, 44, 48, metrics.dbPoolUsagePct],
    retryRate: incidentLike ? [12, 600, 1800, 4900, 800, metrics.retryRate] : [110, 128, 140, 170, 190, metrics.retryRate]
  };
}

export function serviceHealth(metrics: MetricSnapshot) {
  const degraded = metrics.serviceHealth === "degraded";
  const recovering = metrics.serviceHealth === "recovering";

  return [
    {
      name: "payment-api",
      status: degraded && metrics.dbPoolUsagePct > 90 ? ("degraded" as const) : recovering ? ("recovering" as const) : ("healthy" as const),
      detail: degraded ? "High latency from DB pool pressure." : "Create-payment API is accepting requests."
    },
    {
      name: "status-reconciler",
      status: degraded ? ("degraded" as const) : recovering ? ("recovering" as const) : ("healthy" as const),
      detail: degraded ? "Retry rate is above safe budget." : "Backoff and jitter are active."
    },
    {
      name: "mock-upi-switch",
      status: metrics.mockUpiLatencyMs > 1000 ? ("degraded" as const) : ("healthy" as const),
      detail: metrics.mockUpiLatencyMs > 1000 ? "Payment network latency above incident threshold." : "UPI switch simulator responding inside normal latency."
    },
    {
      name: "postgres",
      status: metrics.dbPoolUsagePct > 90 ? ("degraded" as const) : recovering ? ("recovering" as const) : ("healthy" as const),
      detail: `Connection pool at ${metrics.dbPoolUsagePct}%.`
    },
    {
      name: "redis",
      status: "healthy" as const,
      detail: "Idempotency cache reachable."
    }
  ];
}

export const warRoomMessages = [
  { time: "00:01", actor: "incident-commander", tone: "bad" as const, text: "SEV1 declared. Success rate breached P1 threshold. Starting read-only investigation." },
  { time: "00:04", actor: "log-analyst", tone: "warn" as const, text: "Status reconciler retry logs show fixed 1-second polling after release rpay-worker-2026.05.28-001." },
  { time: "00:07", actor: "reliability-engineer", tone: "bad" as const, text: "DB connection pool is saturated. Queue depth and retry rate are above safe limits." },
  { time: "00:11", actor: "release-manager", tone: "warn" as const, text: "Rollback recommended. Human approval required before simulation action runs." },
  { time: "00:18", actor: "incident-commander", tone: "good" as const, text: "Recovery confirmed after stable metrics. RCA draft can be generated from timeline evidence." }
];

export const paymentIncidentRunbookSteps = [
  "Confirm alert and scope.",
  "Check success rate, latency, pending count.",
  "Check recent deployments.",
  "Check payment network latency.",
  "Check status reconciler queue.",
  "Check DB pool saturation.",
  "Decide rollback vs feature flag.",
  "Get human approval.",
  "Monitor recovery.",
  "Generate RCA."
];

export const commonLogPatterns = [
  "UPI switch timeout spike",
  "DB pool exhausted",
  "Retry loop detected",
  "Idempotency replay observed"
];

export function incidentDuration(incident: Incident) {
  const start = new Date(incident.startedAt).getTime();
  const end = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : Date.now();
  const minutes = Math.max(1, Math.round((end - start) / 60000));
  return `${minutes} min`;
}

export function augmentedDeployments<T extends { version: string; service: string; summary: string; mode: string }>(deployments: T[]) {
  return deployments.map((deployment, index) => ({
    ...deployment,
    commit: deployment.version.includes("001") ? "8f4c21a" : deployment.version.includes("002") ? "be91d4f" : "42ac88d",
    author: deployment.version.includes("001") ? "nightly-release" : deployment.version.includes("002") ? "raghu-oncall" : "demo-seed",
    risk: deployment.version.includes("001") || deployment.mode === "buggy" ? "High" : deployment.version.includes("002") ? "Medium" : "Low",
    linkedIncident: deployment.version.includes("001") || deployment.version.includes("002") ? "The Midnight Retry Storm" : index === 0 ? "None" : "None",
    changeSummary: deployment.summary || "Routine deployment"
  }));
}

export function statusCopy(status: string, failureReason?: string | null) {
  if (status === "SUCCESS") return "Payment network confirmation received. No real money moved in this sandbox.";
  if (status === "PENDING") return "Your payment is being confirmed with the payment network simulator.";
  if (status === "FAILED") return `Payment failed${failureReason ? `: ${failureReason}` : ""}.`;
  if (status === "TIMED_OUT") return "Payment network confirmation timed out. Reconciliation is required.";
  if (status === "RECONCILED") return "Operational reconciliation completed.";
  return "Payment is being processed.";
}
