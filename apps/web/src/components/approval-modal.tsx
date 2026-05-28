"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { apiPost } from "../lib/api";
import { Button } from "./ui";

type ApprovalAction = {
  label: string;
  title: string;
  description: string;
  endpoint: string;
  variant?: "danger" | "secondary" | "primary";
};

export function ApprovalModal({ action, onClose }: { action: ApprovalAction; onClose: () => void }) {
  const router = useRouter();
  const [approval, setApproval] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function runAction() {
    setBusy(true);
    setMessage("");
    try {
      await apiPost(action.endpoint);
      setMessage(`${action.label} completed in local simulation.`);
      router.refresh();
      setTimeout(onClose, 750);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111923] p-5 text-zinc-100 shadow-2xl shadow-black">
        <div className="flex gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-200">
            <ShieldAlert size={24} aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-black">{action.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{action.description}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-50">
          <div className="flex gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p>This is a local simulation action. It does not touch real production systems, real UPI APIs, banks, or real payment records.</p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-zinc-300">Type APPROVE SIMULATION to continue</span>
          <input
            className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-bold text-white outline-none focus:border-aqua"
            value={approval}
            onChange={(event) => setApproval(event.target.value)}
            placeholder="APPROVE SIMULATION"
          />
        </label>

        {message ? (
          <div className="mt-4 flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-200">
            <CheckCircle2 size={18} className="mt-0.5 text-aqua" aria-hidden />
            {message}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" className="text-zinc-200 hover:bg-white/10" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={action.variant ?? "danger"} disabled={approval !== "APPROVE SIMULATION" || busy} onClick={runAction}>
            {busy ? "Running..." : action.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ApprovalActionButton({ action }: { action: ApprovalAction }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={action.variant ?? "danger"} onClick={() => setOpen(true)}>
        {action.label}
      </Button>
      {open ? <ApprovalModal action={action} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

