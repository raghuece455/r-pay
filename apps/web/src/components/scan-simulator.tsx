"use client";

import Link from "next/link";
import { useState } from "react";
import { ImagePlus, QrCode, ScanLine, ShieldCheck } from "lucide-react";
import { Button, Card, ContactAvatar, SafetyBanner } from "./ui";
import { formatInr } from "../lib/format";

export function ScanSimulator() {
  const [selected, setSelected] = useState(false);
  const merchant = {
    name: "Fresh Mart",
    vpa: "fresh-mart@rpay",
    amount: 780,
    note: "QR checkout"
  };
  const params = new URLSearchParams({
    payeeVpa: merchant.vpa,
    amount: String(merchant.amount),
    note: merchant.note
  });

  return (
    <div className="space-y-5">
      <section className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[1.5rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(38,215,196,0.22),transparent_48%)]" />
        <div className="absolute left-8 top-8 size-14 border-l-4 border-t-4 border-aqua" />
        <div className="absolute right-8 top-8 size-14 border-r-4 border-t-4 border-aqua" />
        <div className="absolute bottom-8 left-8 size-14 border-b-4 border-l-4 border-aqua" />
        <div className="absolute bottom-8 right-8 size-14 border-b-4 border-r-4 border-aqua" />
        <div className="relative grid size-52 place-items-center rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
          <div className="grid size-40 place-items-center rounded-2xl bg-[repeating-linear-gradient(45deg,#ffffff_0_8px,#101827_8px_16px)]">
            <div className="grid size-20 place-items-center rounded-2xl bg-white text-midnight">
              <QrCode size={46} aria-hidden />
            </div>
          </div>
        </div>
        <p className="absolute bottom-7 text-sm font-bold text-white/70">Scan any UPI QR</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">
          <ImagePlus size={18} aria-hidden />
          Gallery
        </Button>
        <Button variant="secondary" onClick={() => setSelected(true)}>
          <ScanLine size={18} aria-hidden />
          Sample QR
        </Button>
      </div>

      {selected ? (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ContactAvatar name={merchant.name} tone="aqua" size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{merchant.name}</p>
              <p className="text-sm font-semibold text-slate-500">{merchant.vpa}</p>
              <p className="mt-1 text-xl font-extrabold">{formatInr(merchant.amount)}</p>
            </div>
            <ShieldCheck size={22} className="text-emerald-600" aria-hidden />
          </div>
          <Link className="mt-4 flex h-11 items-center justify-center rounded-lg bg-midnight px-4 text-sm font-bold text-white" href={`/pay/confirm?${params.toString()}`}>
            Pay merchant
          </Link>
        </Card>
      ) : null}

      <SafetyBanner tone="warn">Always verify merchant name before paying. This scanner is a local QR simulation.</SafetyBanner>
    </div>
  );
}
