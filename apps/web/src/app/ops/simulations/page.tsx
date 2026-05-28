import { Activity, CheckCircle2, RotateCcw, Siren } from "lucide-react";
import { OpsShell } from "../../../components/ops-shell";
import { SimulationActions } from "../../../components/simulation-actions";
import { apiGet, type Incident, type MetricSnapshot } from "../../../lib/api";
import { formatTime } from "../../../lib/format";
import { OpsPanel, StatusPill } from "../../../components/ui";
import { displayOpsText, serviceDisplayName } from "../../../lib/display";

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

type OpsLog = {
  id: string;
  level: string;
  service: string;
  message: string;
  createdAt: string;
};

function simulationMode(metrics: MetricSnapshot, incidents: Incident[]) {
  const activeIncident = incidents.find((incident) => incident.status !== "RESOLVED");
  if (activeIncident && metrics.serviceHealth === "degraded") return "incident";
  if (metrics.serviceHealth === "recovering") return "recovering";
  if (metrics.retryRate < 300 && metrics.dbPoolUsagePct < 60 && metrics.successRate > 98) return "fixed";
  return "normal";
}

export default async function SimulationsPage() {
  const [metrics, incidents, logs] = await Promise.all([
    apiGet<MetricSnapshot>("/api/ops/metrics", emptyMetrics),
    apiGet<Incident[]>("/api/ops/incidents", []),
    apiGet<OpsLog[]>("/api/ops/logs", [])
  ]);
  const mode = simulationMode(metrics, incidents);

  const impactCards = [
    {
      title: "Normal traffic",
      body: "Healthy success rate, low latency, bounded queue depth, and budgeted retries.",
      icon: Activity,
      tone: "good" as const
    },
    {
      title: "Midnight Retry Storm",
      body: "Success rate drops near 91.4%, p95 latency jumps, DB pool saturates, and pending transactions spike.",
      icon: Siren,
      tone: "bad" as const
    },
    {
      title: "Rollback or fixed retry",
      body: "Aggressive polling is disabled, recovery metrics are written, and the local incident can generate an RCA.",
      icon: RotateCcw,
      tone: "warn" as const
    }
  ];

  return (
    <OpsShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">safe local controls</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Simulations</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Trigger sandbox operational events for the R-Pay demo. These actions never call real UPI, bank, PSP, or payment gateway APIs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Current simulation mode</p>
            <div className="mt-2">
              <StatusPill tone={mode === "incident" ? "bad" : mode === "recovering" ? "warn" : "good"}>{mode}</StatusPill>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {impactCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className={card.tone === "bad" ? "grid size-11 place-items-center rounded-2xl bg-red-400/10 text-red-200" : card.tone === "warn" ? "grid size-11 place-items-center rounded-2xl bg-amber-400/10 text-amber-100" : "grid size-11 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-100"}>
                  <Icon size={21} aria-hidden />
                </span>
                <p className="mt-3 font-black text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{card.body}</p>
              </div>
            );
          })}
        </div>

        <OpsPanel title="The Midnight Retry Storm">
          <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
            <div className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
              <p>
                All controls are local/demo only. Rollback and fixed-retry actions require typing APPROVE SIMULATION before they run, modeling human-in-the-loop production safety.
              </p>
            </div>
          </div>
          <SimulationActions />
        </OpsPanel>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <OpsPanel title="Current metrics">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Success rate", `${metrics.successRate.toFixed(1)}%`],
                ["P95 latency", `${metrics.p95LatencyMs} ms`],
                ["Queue depth", metrics.queueDepth.toLocaleString("en-IN")],
                ["DB pool usage", `${metrics.dbPoolUsagePct}%`],
                ["Pending payments", metrics.pendingCount.toLocaleString("en-IN")],
                ["Retry rate", `${metrics.retryRate.toLocaleString("en-IN")}/min`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </OpsPanel>

          <OpsPanel title="Last action log">
            <div className="space-y-2">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm text-zinc-200">{displayOpsText(log.message)}</p>
                    <StatusPill tone={log.level === "ERROR" ? "bad" : log.level === "WARN" ? "warn" : "info"}>{log.level}</StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{serviceDisplayName(log.service)} / {formatTime(log.createdAt)}</p>
                </div>
              ))}
              {logs.length === 0 ? <p className="text-sm text-zinc-400">No simulation logs yet.</p> : null}
            </div>
          </OpsPanel>
        </div>
      </div>
    </OpsShell>
  );
}
