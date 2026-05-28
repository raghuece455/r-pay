"use client";

import { useState } from "react";
import { BotMessageSquare, CircleHelp, Send } from "lucide-react";
import type { Payment } from "../lib/api";
import { displayReference } from "../lib/display";
import { formatInr } from "../lib/format";
import { Button, Card, SafetyBanner, StatusBadge } from "./ui";

const issueTypes = ["Payment pending", "Money debited but not confirmed", "Wrong receiver", "Duplicate request", "Other"];

export function SupportForm({ transactions }: { transactions: Payment[] }) {
  const [selectedId, setSelectedId] = useState(transactions[0]?.id ?? "");
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const selected = transactions.find((payment) => payment.id === selectedId);

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Select transaction</span>
          <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-aqua" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {transactions.map((payment) => (
              <option key={payment.id} value={payment.id}>
                {payment.payeeVpa} · {formatInr(payment.amount)} · {payment.status}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">Issue type</p>
          <div className="grid gap-2">
            {issueTypes.map((issue) => (
              <button key={issue} type="button" className={`rounded-xl border px-3 py-2 text-left text-sm font-bold ${issueType === issue ? "border-midnight bg-midnight text-white" : "border-slate-200 bg-white text-slate-700"}`} onClick={() => setIssueType(issue)}>
                {issue}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-aqua/15 text-midnight">
            <CircleHelp size={21} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">R-Pay Lab support ticket</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              RPAY-SUP-{selected?.id.slice(-4).toUpperCase() ?? "2042"} · {issueType}
            </p>
            {selected ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{selected.payeeVpa}</span>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="mt-1 text-slate-500">{formatInr(selected.amount)} · Ref {displayReference(selected.mockSwitchRef ?? "pending")}</p>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-midnight text-aqua">
            <BotMessageSquare size={19} aria-hidden />
          </span>
          <div className="rounded-2xl bg-slate-100 p-3 text-sm leading-6 text-slate-700">
            We found your sandbox transaction history and audit timeline. An engineer can review the payment state, switch reference, and idempotency key. Demo SLA: first response within 15 minutes.
          </div>
        </div>
      </Card>

      <SafetyBanner>Support tickets use demo data only. R-Pay never contacts a real bank or UPI system.</SafetyBanner>

      <Button className="w-full">
        <Send size={18} aria-hidden />
        Submit support request
      </Button>
    </div>
  );
}
