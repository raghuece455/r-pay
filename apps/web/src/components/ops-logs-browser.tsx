"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, Search, TriangleAlert } from "lucide-react";
import { commonLogPatterns } from "../lib/demo-data";
import { displayOpsText, eventDisplayName, serviceDisplayName } from "../lib/display";
import { formatTime } from "../lib/format";
import { OpsPanel, StatusPill } from "./ui";

export type OpsLogRow = {
  id: string;
  level: string;
  service: string;
  message: string;
  traceId?: string | null;
  paymentId?: string | null;
  createdAt: string;
};

export type TraceSpanRow = {
  id: string;
  traceId: string;
  spanName: string;
  service: string;
  durationMs: number;
  status: string;
  createdAt: string;
};

const timeRanges = [
  { label: "Last 15 min", minutes: 15 },
  { label: "Last 1 hour", minutes: 60 },
  { label: "All demo data", minutes: 0 }
];

function logTone(level: string) {
  if (level === "ERROR") return "bad";
  if (level === "WARN") return "warn";
  return "info";
}

export function OpsLogsBrowser({ logs, traces }: { logs: OpsLogRow[]; traces: TraceSpanRow[] }) {
  const [service, setService] = useState("all");
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [range, setRange] = useState("All demo data");
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id ?? null);

  const services = useMemo(() => Array.from(new Set(logs.map((log) => log.service))).sort(), [logs]);

  const filteredLogs = useMemo(() => {
    const selectedRange = timeRanges.find((item) => item.label === range);
    const cutoff = selectedRange?.minutes ? Date.now() - selectedRange.minutes * 60 * 1000 : 0;
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedTransactionId = transactionId.trim().toLowerCase();
    const normalizedRequestId = requestId.trim().toLowerCase();

    return logs.filter((log) => {
      if (service !== "all" && log.service !== service) return false;
      if (level !== "all" && log.level !== level) return false;
      if (cutoff && new Date(log.createdAt).getTime() < cutoff) return false;
      if (normalizedQuery && !`${eventDisplayName(log.message)} ${serviceDisplayName(log.service)} ${log.level}`.toLowerCase().includes(normalizedQuery)) return false;
      if (normalizedTransactionId && !(log.paymentId ?? "").toLowerCase().includes(normalizedTransactionId)) return false;
      if (normalizedRequestId && !(log.traceId ?? "").toLowerCase().includes(normalizedRequestId)) return false;
      return true;
    });
  }, [level, logs, query, range, requestId, service, transactionId]);

  const matchingTrace = traces.find((trace) => trace.traceId === filteredLogs.find((log) => log.id === expandedId)?.traceId);

  return (
    <div className="space-y-5">
      <OpsPanel
        title="Log filters"
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
            <Filter size={14} aria-hidden />
            {filteredLogs.length} matches
          </span>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr]">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Search text</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 text-zinc-200">
              <Search size={16} className="text-zinc-500" aria-hidden />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="timeout, retry, DB pool" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Service</span>
            <select className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none" value={service} onChange={(event) => setService(event.target.value)}>
              <option value="all">All services</option>
              {services.map((item) => (
                <option key={item} value={item}>
                  {serviceDisplayName(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Level</span>
            <select className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="all">All levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Time range</span>
            <select className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none" value={range} onChange={(event) => setRange(event.target.value)}>
              {timeRanges.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Transaction ID" />
          <input className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none" value={requestId} onChange={(event) => setRequestId(event.target.value)} placeholder="Request / trace ID" />
        </div>
      </OpsPanel>

      <div className="grid gap-5 2xl:grid-cols-[1fr_330px]">
        <OpsPanel title="Application logs">
          <div className="overflow-x-auto ops-scrollbar">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[170px_90px_150px_1fr_160px_140px_40px] gap-3 border-b border-white/10 px-3 pb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                <span>Timestamp</span>
                <span>Level</span>
                <span>Service</span>
                <span>Message</span>
                <span>Trace ID</span>
                <span>Transaction</span>
                <span />
              </div>
              {filteredLogs.map((log) => {
                const expanded = expandedId === log.id;
                const important = /timeout|pool|retry|storm|saturated/i.test(log.message);
                return (
                  <div key={log.id} className={important ? "border-b border-red-400/20 bg-red-500/[0.04]" : "border-b border-white/10"}>
                    <button className="grid w-full grid-cols-[170px_90px_150px_1fr_160px_140px_40px] gap-3 px-3 py-3 text-left text-sm" onClick={() => setExpandedId(expanded ? null : log.id)}>
                      <span className="text-zinc-500">{formatTime(log.createdAt)}</span>
                      <span>
                        <StatusPill tone={logTone(log.level)}>{log.level}</StatusPill>
                      </span>
                      <span className="font-semibold text-zinc-300">{serviceDisplayName(log.service)}</span>
                      <span className="font-medium text-zinc-200">{eventDisplayName(log.message)}</span>
                      <span className="truncate font-mono text-aqua">{displayOpsText(log.traceId ?? "n/a")}</span>
                      <span className="truncate font-mono text-zinc-400">{log.paymentId ?? "n/a"}</span>
                      <ChevronDown className={expanded ? "rotate-180 text-aqua" : "text-zinc-500"} size={16} aria-hidden />
                    </button>
                    {expanded ? (
                      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
                        <p className="font-black text-white">Log detail</p>
                        <p className="mt-2">This event is simulated evidence for the local R-Pay demo. Use it to correlate retries, traces, and deployment timing.</p>
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                          <span className="rounded-lg bg-white/5 px-3 py-2">trace: {displayOpsText(log.traceId ?? "none")}</span>
                          <span className="rounded-lg bg-white/5 px-3 py-2">payment: {log.paymentId ?? "none"}</span>
                          <span className="rounded-lg bg-white/5 px-3 py-2">service: {serviceDisplayName(log.service)}</span>
                          <span className="rounded-lg bg-white/5 px-3 py-2">raw event: {displayOpsText(log.message)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {filteredLogs.length === 0 ? <p className="p-6 text-sm text-zinc-400">No logs match the selected filters.</p> : null}
            </div>
          </div>
        </OpsPanel>

        <aside className="space-y-5">
          <OpsPanel title="Common patterns">
            <div className="space-y-2">
              {commonLogPatterns.map((pattern) => (
                <div key={pattern} className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-200" aria-hidden />
                  {pattern}
                </div>
              ))}
            </div>
          </OpsPanel>
          <OpsPanel title="Trace summary">
            {matchingTrace ? (
              <div className="rounded-xl border border-aqua/20 bg-aqua/10 p-3">
                <p className="font-mono text-sm text-aqua">{displayOpsText(matchingTrace.traceId)}</p>
                <p className="mt-2 font-black text-white">{eventDisplayName(matchingTrace.spanName)}</p>
                <p className="mt-2 text-sm text-zinc-300">{serviceDisplayName(matchingTrace.service)} completed in {matchingTrace.durationMs} ms with status {matchingTrace.status}.</p>
              </div>
            ) : null}
            <div className="mt-3 space-y-2">
              {traces.slice(0, 5).map((trace) => (
                <div key={trace.id} className="rounded-xl bg-black/20 p-3 text-sm">
                  <p className="truncate font-mono text-aqua">{displayOpsText(trace.traceId)}</p>
                  <p className="mt-1 font-semibold text-zinc-200">{eventDisplayName(trace.spanName)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{trace.durationMs} ms · {trace.status}</p>
                </div>
              ))}
            </div>
          </OpsPanel>
        </aside>
      </div>
    </div>
  );
}
