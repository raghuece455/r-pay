"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, GitBranch, Rocket, ShieldAlert } from "lucide-react";
import { apiPost } from "../lib/api";
import { ApprovalModal } from "./approval-modal";
import { Button } from "./ui";

type ApprovalAction = {
  label: string;
  title: string;
  description: string;
  endpoint: string;
  variant?: "danger" | "secondary" | "primary";
};

export function IncidentActions({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [pendingApproval, setPendingApproval] = useState<ApprovalAction | null>(null);
  const [message, setMessage] = useState("");

  async function generateRca() {
    setMessage("");
    await apiPost("/api/ops/rca/generate", { incidentId });
    setMessage("RCA draft generated from incident timeline.");
    router.refresh();
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" className="border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
          <CheckCircle2 size={17} aria-hidden />
          Acknowledge
        </Button>
        <Button variant="outline" className="border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/10">
          <ShieldAlert size={17} aria-hidden />
          Start mitigation
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            setPendingApproval({
              label: "Rollback worker",
              title: "Approve simulated rollback",
              description: "Rollback is a production-like mitigation. This local action records recovery evidence only.",
              endpoint: "/api/ops/simulations/recover",
              variant: "danger"
            })
          }
        >
          <GitBranch size={17} aria-hidden />
          Rollback worker
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setPendingApproval({
              label: "Deploy fix",
              title: "Approve simulated fixed retry deploy",
              description: "Deploying fixed retry logic is production-like. This local action restores safe retry metrics only.",
              endpoint: "/api/ops/simulations/recover",
              variant: "secondary"
            })
          }
        >
          <Rocket size={17} aria-hidden />
          Deploy fixed retry
        </Button>
        <Button className="sm:col-span-2" onClick={generateRca}>
          <FileText size={17} aria-hidden />
          Generate RCA
        </Button>
      </div>
      {message ? <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</p> : null}
      {pendingApproval ? <ApprovalModal action={pendingApproval} onClose={() => setPendingApproval(null)} /> : null}
    </>
  );
}

