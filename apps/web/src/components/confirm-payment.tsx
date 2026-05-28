"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeIndianRupee, KeyRound, ShieldCheck } from "lucide-react";
import { apiPost } from "../lib/api";
import { formatInr } from "../lib/format";
import { Button, Card, ContactAvatar, InfoRow, SafetyBanner } from "./ui";

export function ConfirmPayment({ payeeVpa, amount, note }: { payeeVpa: string; amount: number; note: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinReady, setPinReady] = useState(false);

  async function submitPayment() {
    setLoading(true);
    setError("");
    try {
      const idempotencyKey = `rpay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const result = await apiPost<{ payment: { id: string } }>(
        "/api/payments",
        {
          payerVpa: "raghu@rpay",
          payeeVpa,
          amount,
          currency: "INR",
          note
        },
        { "Idempotency-Key": idempotencyKey }
      );
      router.push(`/pay/status/${result.payment.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-midnight to-indigo p-5 text-white">
          <div className="flex items-center gap-4">
            <ContactAvatar name={payeeVpa} tone="aqua" size="lg" />
            <div>
              <p className="text-sm text-white/60">Paying</p>
              <p className="text-lg font-semibold">{payeeVpa}</p>
            </div>
          </div>
          <p className="mt-6 text-5xl font-extrabold tracking-normal">{formatInr(amount)}</p>
          <p className="mt-2 text-sm text-white/70">{note || "No note added"}</p>
        </div>
        <div className="space-y-3 p-4 text-sm">
          <InfoRow label="From" value="HDFC Bank ending 4242" />
          <InfoRow label="Fee" value="No platform fee" />
          <InfoRow label="Network" value="UPI switch simulator" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-midnight">
            <KeyRound size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Sandbox UPI PIN step</p>
            <p className="text-xs leading-5 text-slate-500">Tap to simulate secure authorization. No real PIN is used.</p>
          </div>
          <button type="button" onClick={() => setPinReady(true)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${pinReady ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {pinReady ? "Ready" : "Tap"}
          </button>
        </div>
      </Card>

      <SafetyBanner tone="warn">This is a simulation. No real money will move. Confirm only after verifying the receiver name and amount.</SafetyBanner>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <Button variant="outline" disabled={loading} onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft size={18} aria-hidden />
        </Button>
        <Button className="w-full" disabled={loading} onClick={submitPayment}>
          <BadgeIndianRupee size={18} aria-hidden />
          {loading ? "Processing..." : "Confirm Payment"}
        </Button>
      </div>
    </div>
  );
}
