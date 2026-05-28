"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, AlertTriangle, FileText, GitBranch, RotateCcw, Rocket, Siren } from "lucide-react";
import { apiPost } from "../lib/api";
import { Button } from "./ui";
import { ApprovalModal } from "./approval-modal";

type PendingApproval = {
  label: string;
  title: string;
  description: string;
  endpoint: string;
  variant?: "danger" | "secondary" | "primary";
};

export function SimulationActions() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);

  async function run(label: string, action: () => Promise<unknown>) {
    setBusy(label);
    setMessage("");
    try {
      await action();
      setMessage(`${label} complete`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${label} failed`);
    } finally {
      setBusy("");
    }
  }

  const simulationCards = [
    {
      title: "Reset demo",
      body: "Return metrics to a recovered baseline and keep the sandbox boundary.",
      icon: RotateCcw,
      action: () => run("Reset demo", () => apiPost("/api/ops/simulations/recover")),
      variant: "secondary" as const
    },
    {
      title: "Start normal traffic",
      body: "Write healthy payment metrics and normal operational logs.",
      icon: Activity,
      action: () => run("Normal traffic", () => apiPost("/api/ops/simulations/normal-traffic")),
      variant: "primary" as const
    },
    {
      title: "Midnight Retry Storm",
      body: "Drop success rate, spike latency, saturate DB pool, and create an active incident.",
      icon: Siren,
      action: () => run("Midnight Retry Storm", () => apiPost("/api/ops/simulations/midnight-retry-storm")),
      variant: "danger" as const
    },
    {
      title: "Rollback bad worker",
      body: "Approval required. Simulates rollback of the buggy status reconciler.",
      icon: GitBranch,
      action: () =>
        setPendingApproval({
          label: "Rollback worker",
          title: "Approve simulated rollback",
          description: "This will run the local recovery endpoint and record mitigation evidence for the R-Pay demo.",
          endpoint: "/api/ops/simulations/recover",
          variant: "danger"
        }),
      variant: "danger" as const
    },
    {
      title: "Deploy fixed retry logic",
      body: "Approval required. Simulates fixed retry behavior with backoff, jitter, budget, and circuit breaker.",
      icon: Rocket,
      action: () =>
        setPendingApproval({
          label: "Deploy fix",
          title: "Approve simulated fixed retry deploy",
          description: "This records a human-approved fixed retry deployment in the local simulation.",
          endpoint: "/api/ops/simulations/recover",
          variant: "secondary"
        }),
      variant: "secondary" as const
    },
    {
      title: "Generate RCA",
      body: "Create an RCA draft from the simulated incident timeline and evidence.",
      icon: FileText,
      action: () => run("Generate RCA", () => apiPost("/api/ops/rca/generate")),
      variant: "primary" as const
    }
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {simulationCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-aqua">
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <p className="font-black text-white">{card.title}</p>
                  <p className="mt-1 min-h-12 text-sm leading-6 text-zinc-400">{card.body}</p>
                </div>
              </div>
              <Button className="mt-4 w-full" variant={card.variant} disabled={Boolean(busy)} onClick={card.action}>
                {busy === card.title ? "Running..." : card.title}
              </Button>
            </div>
          );
        })}
        {message ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 md:col-span-2 xl:col-span-3">
            <AlertTriangle size={16} className="mr-2 inline text-aqua" aria-hidden />
            {message}
          </p>
        ) : null}
      </div>
      {pendingApproval ? <ApprovalModal action={pendingApproval} onClose={() => setPendingApproval(null)} /> : null}
    </>
  );
}
