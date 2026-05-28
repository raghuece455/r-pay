"use client";

import { useMemo, useState } from "react";
import { Clipboard, Copy, ShieldAlert } from "lucide-react";
import { OpsPanel, RunbookChecklist, StatusPill } from "./ui";

export type RunbookRow = {
  id: string;
  title: string;
  slug: string;
  body: string;
};

const fallbackRunbook: RunbookRow = {
  id: "payment-success-rate-degradation",
  title: "Payment success rate degradation",
  slug: "payment-success-rate-degradation",
  body: "Use this runbook when payment success rate drops, latency rises, or pending payments grow faster than reconciliation."
};

const commands = [
  "pnpm simulate:incident",
  "curl http://localhost:4000/api/ops/metrics",
  "curl -X POST http://localhost:4000/api/ops/simulations/recover",
  "curl -X POST http://localhost:4000/api/ops/rca/generate"
];

const runbookSections = [
  {
    title: "First Five Minutes",
    steps: [
      "Declare the incident.",
      "Start read-only investigation.",
      "Check success rate, p95 latency, pending count, queue depth, DB pool usage, and payment network latency.",
      "Check recent deployments.",
      "Preserve payment creation if safe.",
      "Do not mark payments SUCCESS without payment network simulator confirmation.",
      "Do not delete audit logs."
    ]
  },
  {
    title: "Midnight Retry Storm Mitigation",
    steps: [
      "Disable aggressive status polling.",
      "Roll back the status reconciler worker.",
      "Increase status check interval temporarily.",
      "Pause non-critical reconciliation jobs.",
      "Keep payment creation API running."
    ]
  },
  {
    title: "Permanent Fix",
    steps: [
      "Restore exponential backoff and jitter.",
      "Add retry budget.",
      "Add circuit breaker for slow UPI switch simulator.",
      "Add alerts for retry rate, queue depth, pending age, and DB pool saturation.",
      "Add load tests for slow payment network behavior."
    ]
  }
];

export function RunbookBrowser({ runbooks }: { runbooks: RunbookRow[] }) {
  const allRunbooks = runbooks.length ? runbooks : [fallbackRunbook];
  const [selectedId, setSelectedId] = useState(allRunbooks[0]?.id ?? fallbackRunbook.id);
  const [copied, setCopied] = useState("");
  const selected = useMemo(() => allRunbooks.find((runbook) => runbook.id === selectedId) ?? allRunbooks[0] ?? fallbackRunbook, [allRunbooks, selectedId]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("Clipboard unavailable");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <OpsPanel title="Runbook list">
        <div className="space-y-2">
          {allRunbooks.map((runbook) => (
            <button
              key={runbook.id}
              className={selected.id === runbook.id ? "w-full rounded-xl border border-aqua/30 bg-aqua/10 p-3 text-left" : "w-full rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20"}
              onClick={() => setSelectedId(runbook.id)}
            >
              <p className="font-black text-white">{runbook.title}</p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">{runbook.slug}</p>
            </button>
          ))}
        </div>
      </OpsPanel>

      <div className="space-y-5">
        <OpsPanel
          title={selected.title}
          action={
            <div className="flex gap-2">
              <StatusPill tone="bad">SEV1</StatusPill>
              <StatusPill tone="warn">Payments</StatusPill>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Owner</p>
              <p className="mt-2 font-black text-white">payments-sre</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Last reviewed</p>
              <p className="mt-2 font-black text-white">May 28, 2026</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Severity mapping</p>
              <p className="mt-2 font-black text-white">P1 if success rate &lt; 95%</p>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
            Use this playbook when payment success rate drops, latency rises, or pending payments grow faster than reconciliation. Start with read-only evidence, protect payment creation, and require human approval before rollback or deploy actions.
          </p>
        </OpsPanel>

        <OpsPanel title="Operational runbook">
          <div className="space-y-4">
            {runbookSections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-white">{section.title}</h3>
                  <StatusPill tone={section.title === "First Five Minutes" ? "bad" : section.title === "Midnight Retry Storm Mitigation" ? "warn" : "good"}>
                    {section.steps.length} steps
                  </StatusPill>
                </div>
                <RunbookChecklist dark steps={section.steps} />
              </section>
            ))}
          </div>
        </OpsPanel>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <OpsPanel title="Copy commands">
            <div className="space-y-2">
              {commands.map((command) => (
                <button key={command} className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 p-3 text-left font-mono text-sm text-zinc-200" onClick={() => copy(command)}>
                  <span className="truncate">{command}</span>
                  <Copy size={16} className="shrink-0 text-aqua" aria-hidden />
                </button>
              ))}
            </div>
            {copied ? <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-zinc-300">{copied === "Clipboard unavailable" ? copied : "Command copied."}</p> : null}
          </OpsPanel>

          <OpsPanel title="Payment safety warnings">
            <div className="space-y-3">
              {[
                "Do not mark a payment SUCCESS without valid payment network confirmation.",
                "Do not delete audit logs during investigation.",
                "Deployment or payment-state correction requires human approval."
              ].map((warning) => (
                <div key={warning} className="flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-50">
                  <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden />
                  {warning}
                </div>
              ))}
            </div>
          </OpsPanel>
        </div>

        <OpsPanel title="War-room note template">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-6 text-zinc-300">
            <p>[00:00] SEV1 acknowledged. Scope: payment success rate degradation.</p>
            <p>[00:03] Checking recent deployments, payment network latency, queue depth, and DB pool usage.</p>
            <p>[00:08] Human approval required before rollback or fixed retry deploy.</p>
          </div>
        </OpsPanel>
      </div>
    </div>
  );
}
