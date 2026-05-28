import { Database, GitCommit, RadioTower, TimerReset } from "lucide-react";
import { AiIncidentAnalysis } from "../../../../components/ai-incident-analysis";
import { IncidentActions } from "../../../../components/incident-actions";
import { OpsShell } from "../../../../components/ops-shell";
import { OpsStatusPill } from "../../../../components/status";
import { IncidentSeverityBadge, OpsPanel, RcaPanel, RunbookChecklist, StatusPill, Timeline, WarRoomMessage } from "../../../../components/ui";
import { apiGet, type Incident } from "../../../../lib/api";
import { paymentIncidentRunbookSteps, warRoomMessages } from "../../../../lib/demo-data";
import { displayOpsText, eventDisplayName, serviceDisplayName } from "../../../../lib/display";
import { formatTime } from "../../../../lib/format";

type OpsLog = { id: string; level: string; service: string; message: string; traceId?: string | null; paymentId?: string | null; createdAt: string };
type TraceSpan = { id: string; traceId: string; spanName: string; service: string; durationMs: number; status: string; createdAt: string };

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [incident, logs, traces] = await Promise.all([
    apiGet<Incident | null>(`/api/ops/incidents/${resolvedParams.id}`, null),
    apiGet<OpsLog[]>("/api/ops/logs", []),
    apiGet<TraceSpan[]>("/api/ops/traces", [])
  ]);

  if (!incident) {
    return (
      <OpsShell>
        <p className="rounded-lg border border-white/10 bg-white/[0.04] p-5">Incident not found.</p>
      </OpsShell>
    );
  }

  const evidence = [
    { title: "DB pool at 100%", body: "PostgreSQL connection pool saturated during retry storm.", icon: Database, tone: "bad" },
    { title: "Queue depth exploded", body: "Status Reconciler queue depth reached unsafe levels.", icon: TimerReset, tone: "bad" },
    { title: "Payment network latency increased", body: "UPI switch simulator p95 latency rose while retries continued.", icon: RadioTower, tone: "warn" },
    { title: "Suspicious release", body: "rpay-worker-2026.05.28-001 changed retry polling behavior.", icon: GitCommit, tone: "warn" }
  ] as const;

  return (
    <OpsShell>
      <div className="space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-aqua">{incident.incidentKey}</p>
              <h1 className="mt-1 text-4xl font-black tracking-tight">{incident.title}</h1>
              <p className="mt-3 max-w-4xl text-zinc-300">{displayOpsText(incident.summary)}</p>
            </div>
            <div className="flex gap-2">
              <IncidentSeverityBadge severity={incident.severity} />
              <OpsStatusPill status={incident.status} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Impact</p>
              <p className="mt-2 text-sm font-bold text-white">Users see payments stuck in PENDING.</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Affected services</p>
              <p className="mt-2 text-sm font-bold text-white">Payment API, Status Reconciler, PostgreSQL</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Hypothesis</p>
              <p className="mt-2 text-sm font-bold text-white">Retry storm after worker release.</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Commander</p>
              <p className="mt-2 text-sm font-bold text-white">Raghu · payment-oncall</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
          <div className="space-y-4">
            <OpsPanel title="Incident timeline">
              <Timeline
                dark
                items={(incident.timeline ?? []).map((event) => ({
                  title: event.eventType,
                  body: displayOpsText(event.message),
                  meta: `${event.actor} · ${formatTime(event.createdAt)}`
                }))}
              />
            </OpsPanel>

            <OpsPanel title="Evidence">
              <div className="grid gap-3 md:grid-cols-2">
                {evidence.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-10 place-items-center rounded-xl ${item.tone === "bad" ? "bg-red-500/10 text-red-200" : "bg-amber-500/10 text-amber-100"}`}>
                          <Icon size={20} aria-hidden />
                        </span>
                        <p className="font-black text-white">{item.title}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </OpsPanel>

            <OpsPanel title="Logs and traces evidence">
              <div className="grid gap-3 lg:grid-cols-2">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="rounded-xl bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-zinc-200">{eventDisplayName(log.message)}</p>
                      <StatusPill tone={log.level === "WARN" ? "warn" : log.level === "ERROR" ? "bad" : "info"}>{log.level}</StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{serviceDisplayName(log.service)} · trace {log.traceId ?? "n/a"}</p>
                  </div>
                ))}
                {traces.slice(0, 4).map((trace) => (
                  <div key={trace.id} className="rounded-xl bg-black/20 p-3">
                    <p className="font-mono text-sm text-aqua">{displayOpsText(trace.traceId)}</p>
                    <p className="mt-1 text-sm font-bold text-zinc-200">{eventDisplayName(trace.spanName)}</p>
                    <p className="mt-1 text-xs text-zinc-500">{serviceDisplayName(trace.service)} · {trace.durationMs} ms · {trace.status}</p>
                  </div>
                ))}
              </div>
            </OpsPanel>

            <OpsPanel title="War room transcript">
              <div className="space-y-3">
                {warRoomMessages.map((message) => (
                  <WarRoomMessage key={`${message.time}-${message.actor}`} actor={message.actor} time={message.time} tone={message.tone}>
                    {message.text}
                  </WarRoomMessage>
                ))}
              </div>
            </OpsPanel>
          </div>

          <aside className="space-y-4">
            <OpsPanel title="Responders">
              <div className="space-y-2 text-sm">
                {["incident-commander: Raghu", "log-analyst: Priya", "trace-analyst: Dev", "release-manager: Anita"].map((responder) => (
                  <p key={responder} className="rounded-xl bg-black/20 p-3 font-semibold text-zinc-200">{responder}</p>
                ))}
              </div>
            </OpsPanel>

            <OpsPanel title="Mitigation actions">
              <IncidentActions incidentId={incident.id} />
            </OpsPanel>

            <OpsPanel title="Runbook checklist">
              <RunbookChecklist dark steps={paymentIncidentRunbookSteps} />
            </OpsPanel>

            <OpsPanel title="Decision log">
              <Timeline
                dark
                items={[
                  { title: "Rollback vs hotfix", body: "Rollback recommended first because the bad worker release is isolated.", meta: "human approval required" },
                  { title: "Permanent fix", body: "Restore backoff, jitter, retry budget, and circuit breaker.", meta: "deploy after tests pass" }
                ]}
              />
            </OpsPanel>
          </aside>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <AiIncidentAnalysis />
          <RcaPanel id="rca" body={displayOpsText(incident.rcaDrafts?.[0]?.body)} />
        </section>
      </div>
    </OpsShell>
  );
}
