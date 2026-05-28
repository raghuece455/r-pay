"use client";

import { Clock3, GitBranch, GitCommit, RotateCcw, ShieldAlert, UserRound } from "lucide-react";
import { displayOpsText, serviceDisplayName } from "../lib/display";
import { formatTime } from "../lib/format";
import { ApprovalActionButton } from "./approval-modal";
import { OpsPanel, StatusPill } from "./ui";

export type DeploymentDisplayRow = {
  id: string;
  version: string;
  service: string;
  status: string;
  deployedBy: string;
  summary: string;
  mode: string;
  deployedAt: string;
  commit: string;
  author: string;
  risk: string;
  linkedIncident: string;
  changeSummary: string;
};

function riskTone(risk: string) {
  if (risk === "High") return "bad";
  if (risk === "Medium") return "warn";
  return "good";
}

export function DeploymentsTable({ deployments }: { deployments: DeploymentDisplayRow[] }) {
  const visibleDeployments = Array.from(
    [...deployments]
      .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime())
      .reduce((rows, deployment) => {
        const key = `${deployment.version}:${deployment.service}`;
        if (!rows.has(key)) rows.set(key, deployment);
        return rows;
      }, new Map<string, DeploymentDisplayRow>())
      .values()
  );
  const suspicious = visibleDeployments.find((deployment) => deployment.version.includes("2026.05.28-001"));

  return (
    <div className="space-y-5">
      {suspicious ? (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-red-400/10 text-red-200">
                <ShieldAlert size={21} aria-hidden />
              </span>
              <div>
                <p className="font-black text-white">Suspicious release detected</p>
                <p className="mt-1 text-sm text-red-100/80">{suspicious.version} changed status reconciler polling behavior and is linked to The Midnight Retry Storm.</p>
              </div>
            </div>
            <ApprovalActionButton
              action={{
                label: "Rollback worker",
                title: "Approve simulated rollback",
                description: "This local action records a rollback-style recovery for the R-Pay simulation. It does not touch real production systems.",
                endpoint: "/api/ops/simulations/recover",
                variant: "danger"
              }}
            />
          </div>
        </div>
      ) : null}

      <OpsPanel title="Deployment history">
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleDeployments.map((deployment) => {
            const highRisk = deployment.risk === "High";
            const rollbackCandidate = highRisk && deployment.version.includes("2026.05.28-001");

            return (
              <article
                key={`${deployment.version}-${deployment.service}`}
                className={
                  highRisk
                    ? "rounded-2xl border border-amber-300/35 bg-amber-500/[0.08] p-4 shadow-lg shadow-black/10"
                    : "rounded-2xl border border-white/10 bg-black/20 p-4 shadow-lg shadow-black/10"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-bold text-white">{deployment.version}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-400">{serviceDisplayName(deployment.service)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={riskTone(deployment.risk)}>{deployment.risk} risk</StatusPill>
                    <StatusPill tone={deployment.status === "DEPLOYED" ? "good" : "warn"}>{deployment.status}</StatusPill>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-200">{displayOpsText(deployment.changeSummary)}</p>

                {highRisk ? (
                  <div className="mt-3 rounded-xl border border-amber-300/20 bg-black/25 p-3 text-sm leading-6 text-amber-50">
                    <p className="font-bold">Suspicious release detected</p>
                    <p className="mt-1 text-amber-100/75">Changed status reconciler polling behavior.</p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <GitCommit size={14} aria-hidden />
                    <span className="font-mono text-aqua">{deployment.commit}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <UserRound size={14} aria-hidden />
                    {deployment.author || deployment.deployedBy}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <Clock3 size={14} aria-hidden />
                    {formatTime(deployment.deployedAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {deployment.linkedIncident !== "None" ? (
                    <span className="rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-100">
                      Linked incident: {deployment.linkedIncident}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-zinc-400">No linked incident</span>
                  )}
                  {rollbackCandidate ? (
                    <ApprovalActionButton
                      action={{
                        label: "Rollback worker",
                        title: "Approve simulated worker rollback",
                        description: "This records a local rollback for the worker release suspected in The Midnight Retry Storm.",
                        endpoint: "/api/ops/simulations/recover",
                        variant: "danger"
                      }}
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
          {visibleDeployments.length === 0 ? <p className="rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-400">No deployments yet.</p> : null}
        </div>
      </OpsPanel>

      <OpsPanel title="Rollback guardrail">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            "Confirm incident scope before touching worker behavior.",
            "Human approval is required for rollback or fixed retry deploy.",
            "Never mark a payment SUCCESS without valid payment network confirmation."
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
              <GitBranch size={17} className="mt-0.5 shrink-0 text-aqua" aria-hidden />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ApprovalActionButton
            action={{
              label: "Deploy fixed retry",
              title: "Approve simulated fixed retry deploy",
              description: "This records a fixed retry deployment for the local R-Pay simulation after the rollback decision.",
              endpoint: "/api/ops/simulations/recover",
              variant: "secondary"
            }}
          />
          <ApprovalActionButton
            action={{
              label: "Rollback bad worker",
              title: "Approve simulated worker rollback",
              description: "This records a local rollback for the worker release suspected in The Midnight Retry Storm.",
              endpoint: "/api/ops/simulations/recover",
              variant: "danger"
            }}
          />
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-zinc-300">
            <RotateCcw size={16} aria-hidden />
            Actions are sandbox-only
          </span>
        </div>
      </OpsPanel>
    </div>
  );
}
