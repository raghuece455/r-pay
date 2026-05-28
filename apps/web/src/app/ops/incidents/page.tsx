import Link from "next/link";
import { Siren, SlidersHorizontal } from "lucide-react";
import { OpsShell } from "../../../components/ops-shell";
import { OpsStatusPill } from "../../../components/status";
import { IncidentSeverityBadge, OpsPanel, StatusPill } from "../../../components/ui";
import { apiGet, type Incident } from "../../../lib/api";
import { incidentDuration } from "../../../lib/demo-data";
import { serviceDisplayName } from "../../../lib/display";
import { formatTime } from "../../../lib/format";

export default async function IncidentsPage() {
  const incidents = await apiGet<Incident[]>("/api/ops/incidents", []);
  const active = incidents.filter((incident) => incident.status !== "RESOLVED");
  const recovering = incidents.filter((incident) => incident.status === "MONITORING" || incident.status === "MITIGATING");
  const resolved = incidents.filter((incident) => incident.status === "RESOLVED");

  const tabs = [
    ["Active", active.length],
    ["Recovering", recovering.length],
    ["Resolved", resolved.length],
    ["All", incidents.length]
  ];

  return (
    <OpsShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">Incident queue</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Incidents</h1>
            <p className="mt-2 text-sm text-zinc-400">Search, triage, and coordinate payment incidents.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-zinc-200">
              Declare incident
            </button>
            <Link href="/ops/simulations" className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">
              <Siren size={17} aria-hidden />
              Simulation
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {tabs.map(([label, count]) => (
            <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-zinc-200">
              {label} · {count}
            </span>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-zinc-500" aria-hidden />
            <input className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none" placeholder="Filter by title, service, owner, or impact" />
            <StatusPill tone="info">production-sim</StatusPill>
          </div>
        </div>

        <OpsPanel title="Incident list">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[120px_1.5fr_130px_140px_120px_1fr] gap-3 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-wide text-zinc-500">
              <span>Severity</span>
              <span>Incident</span>
              <span>Status</span>
              <span>Duration</span>
              <span>Owner</span>
              <span>Customer impact</span>
            </div>
            {incidents.map((incident) => (
              <Link key={incident.id} href={`/ops/incidents/${incident.id}`} className="grid grid-cols-[120px_1.5fr_130px_140px_120px_1fr] gap-3 border-t border-white/10 px-4 py-4 text-sm hover:bg-white/[0.04]">
                <span>
                  <IncidentSeverityBadge severity={incident.severity} />
                </span>
                <span>
                  <span className="block font-black text-white">{incident.title}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{serviceDisplayName(incident.service)} · started {formatTime(incident.startedAt)}</span>
                </span>
                <span>
                  <OpsStatusPill status={incident.status} />
                </span>
                <span className="font-semibold text-zinc-300">{incidentDuration(incident)}</span>
                <span className="font-semibold text-zinc-300">Raghu</span>
                <span className="text-zinc-400">Users may see payments stuck in PENDING. Current mitigation: fixed retry deployment.</span>
              </Link>
            ))}
            {incidents.length === 0 ? <p className="p-5 text-zinc-400">No incidents yet. Trigger the Midnight Retry Storm from simulations.</p> : null}
          </div>
        </OpsPanel>
      </div>
    </OpsShell>
  );
}

