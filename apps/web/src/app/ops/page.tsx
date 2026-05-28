import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AiIncidentAnalysis } from "../../components/ai-incident-analysis";
import { OpsShell } from "../../components/ops-shell";
import { OpsStatusPill } from "../../components/status";
import { IncidentBanner, MetricCard, OpsPanel, ServiceHealthGrid, Sparkline, StatusPill, Timeline } from "../../components/ui";
import { apiGet, type Incident, type MetricSnapshot } from "../../lib/api";
import { augmentedDeployments, metricSeries, serviceHealth } from "../../lib/demo-data";
import { displayOpsText, eventDisplayName, serviceDisplayName } from "../../lib/display";
import { formatTime } from "../../lib/format";

const emptyMetrics: MetricSnapshot = {
  successRate: 0,
  failureRate: 0,
  pendingCount: 0,
  p95LatencyMs: 0,
  queueDepth: 0,
  dbPoolUsagePct: 0,
  mockUpiLatencyMs: 0,
  retryRate: 0,
  serviceHealth: "unknown",
  createdAt: new Date().toISOString()
};

type OpsLogRow = { id: string; level: string; service: string; message: string; createdAt: string };
type DeploymentRow = { id: string; version: string; service: string; status: string; deployedBy: string; summary: string; mode: string; deployedAt: string };

export default async function OpsHomePage() {
  const [metrics, incidents, logs, rawDeployments] = await Promise.all([
    apiGet<MetricSnapshot>("/api/ops/metrics", emptyMetrics),
    apiGet<Incident[]>("/api/ops/incidents", []),
    apiGet<OpsLogRow[]>("/api/ops/logs", []),
    apiGet<DeploymentRow[]>("/api/ops/deployments", [])
  ]);
  const deployments = augmentedDeployments(rawDeployments);
  const active = incidents.find((incident) => incident.status !== "RESOLVED");
  const series = metricSeries(metrics);
  const services = serviceHealth(metrics);

  const metricCards: Array<{
    label: string;
    value: string;
    delta: string;
    threshold: string;
    values: number[];
    tone: "good" | "warn" | "bad" | "info";
  }> = [
    { label: "Success rate", value: `${metrics.successRate.toFixed(1)}%`, delta: metrics.successRate < 95 ? "-7.8%" : "+0.1%", threshold: "P1 < 95%", values: series.successRate, tone: metrics.successRate < 95 ? "bad" : "good" },
    { label: "Failed payments", value: `${metrics.failureRate.toFixed(1)}%`, delta: metrics.failureRate > 2 ? "+4.2%" : "-0.1%", threshold: "Warn > 2%", values: [0.4, 0.5, 0.7, metrics.failureRate], tone: metrics.failureRate > 2 ? "bad" : "good" },
    { label: "Pending payments", value: metrics.pendingCount.toLocaleString("en-IN"), delta: metrics.pendingCount > 1500 ? "8x" : "stable", threshold: "Warn > 1,200", values: [412, 600, 1200, metrics.pendingCount], tone: metrics.pendingCount > 1500 ? "warn" : "good" },
    { label: "P95 latency", value: `${metrics.p95LatencyMs} ms`, delta: metrics.p95LatencyMs > 1000 ? "+4.5s" : "-80ms", threshold: "P1 > 3s", values: series.latency, tone: metrics.p95LatencyMs > 3000 ? "bad" : metrics.p95LatencyMs > 1000 ? "warn" : "good" },
    { label: "Queue depth", value: metrics.queueDepth.toLocaleString("en-IN"), delta: metrics.queueDepth > 10000 ? "exploding" : "normal", threshold: "Warn > 5,000", values: series.queueDepth, tone: metrics.queueDepth > 10000 ? "bad" : metrics.queueDepth > 5000 ? "warn" : "good" },
    { label: "DB pool usage", value: `${metrics.dbPoolUsagePct}%`, delta: metrics.dbPoolUsagePct >= 90 ? "saturated" : "safe", threshold: "P1 >= 95%", values: series.dbPool, tone: metrics.dbPoolUsagePct >= 90 ? "bad" : metrics.dbPoolUsagePct > 70 ? "warn" : "good" },
    { label: "Payment network latency", value: `${metrics.mockUpiLatencyMs} ms`, delta: metrics.mockUpiLatencyMs > 1000 ? "slow" : "normal", threshold: "Warn > 1s", values: series.latency, tone: metrics.mockUpiLatencyMs > 1000 ? "warn" : "good" },
    { label: "Retry rate", value: `${metrics.retryRate.toLocaleString("en-IN")}/min`, delta: metrics.retryRate > 1000 ? "unsafe" : "budgeted", threshold: "Warn > 800/min", values: series.retryRate, tone: metrics.retryRate > 1000 ? "bad" : "good" }
  ];

  return (
    <OpsShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">production-sim</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">R-Pay IncidentDesk</h1>
            <p className="mt-2 text-sm text-zinc-400">Last updated {formatTime(metrics.createdAt)} · On-call engineer: Raghu</p>
          </div>
          <OpsStatusPill status={metrics.serviceHealth} />
        </header>

        {active ? (
          <IncidentBanner>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black">P1 active: payment confirmations delayed</p>
                <p className="mt-1 text-red-100/80">{displayOpsText(active.summary)}</p>
              </div>
              <Link className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-xs font-black text-red-950 shadow-lg shadow-red-950/20 ring-1 ring-red-50/60" href={`/ops/incidents/${active.id}`}>
                Open incident
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </IncidentBanner>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <OpsPanel title="Payment health over time">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-sm font-semibold text-zinc-400">Success rate</p>
                <Sparkline values={series.successRate} color="#10b981" height={70} />
              </div>
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-sm font-semibold text-zinc-400">Latency</p>
                <Sparkline values={series.latency} color="#f59e0b" height={70} />
              </div>
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-sm font-semibold text-zinc-400">Queue depth</p>
                <Sparkline values={series.queueDepth} color="#ef4444" height={70} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                ["99.2%", "baseline success"],
                ["91.4%", "incident low"],
                ["4.8 s", "latency peak"],
                ["10 min", "recovery watch"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </OpsPanel>

          <OpsPanel title="Service health">
            <ServiceHealthGrid services={services} />
          </OpsPanel>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
          <OpsPanel title="Active incident">
            {active ? (
              <Link href={`/ops/incidents/${active.id}`} className="block rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{active.title}</p>
                    <p className="mt-1 text-sm text-zinc-300">{displayOpsText(active.summary)}</p>
                    <p className="mt-3 text-xs font-bold text-red-100/70">Current mitigation: rollback completed, monitoring recovery.</p>
                  </div>
                  <OpsStatusPill status={active.severity} />
                </div>
              </Link>
            ) : (
              <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">No active incidents.</p>
            )}
          </OpsPanel>

          <OpsPanel title="Recent logs">
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded-xl bg-black/20 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-zinc-300">{eventDisplayName(log.message)}</span>
                    <StatusPill tone={log.level === "WARN" ? "warn" : log.level === "ERROR" ? "bad" : "info"}>{log.level}</StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{serviceDisplayName(log.service)} · {formatTime(log.createdAt)}</p>
                </div>
              ))}
            </div>
          </OpsPanel>

          <OpsPanel title="Deployment correlation">
            <Timeline
              dark
              items={deployments.slice(0, 4).map((deployment) => ({
                title: deployment.version,
                body: displayOpsText(deployment.changeSummary),
                meta: `${serviceDisplayName(deployment.service)} · risk ${deployment.risk}`
              }))}
            />
          </OpsPanel>
        </section>

        <AiIncidentAnalysis />
      </div>
    </OpsShell>
  );
}
