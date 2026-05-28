"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Send, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { recentContacts } from "../lib/demo-data";
import { Button, Card, ContactAvatar, SafetyBanner } from "./ui";

export function PayForm() {
  const router = useRouter();
  const [payeeVpa, setPayeeVpa] = useState("chai-shop@rpay");
  const [amount, setAmount] = useState("150");
  const [note, setNote] = useState("Masala chai");
  const [mode, setMode] = useState("UPI ID");
  const [error, setError] = useState("");

  const isValidUpi = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(payeeVpa.trim());

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidUpi) {
      setError("Enter a sandbox UPI-style ID like chai-shop@rpay.");
      return;
    }
    if (!Number(amount) || Number(amount) <= 0) {
      setError("Enter a valid amount above ₹0.");
      return;
    }
    const params = new URLSearchParams({ payeeVpa, amount, note });
    router.push(`/pay/confirm?${params.toString()}`);
  }

  const modes = [
    { label: "UPI ID", icon: Send },
    { label: "Phone", icon: Smartphone },
    { label: "Bank", icon: Landmark },
    { label: "Saved", icon: UserRound }
  ];

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid grid-cols-4 rounded-2xl bg-slate-100 p-1">
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${mode === item.label ? "bg-white text-midnight shadow-sm" : "text-slate-500"}`}
              onClick={() => setMode(item.label)}
            >
              <Icon size={16} aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      <Card className="space-y-4 p-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Receiver</span>
          <input
            className={`h-14 w-full rounded-xl border bg-white px-3 text-base font-semibold outline-none transition focus:border-aqua ${error && !isValidUpi ? "border-red-300" : "border-slate-200"}`}
            value={payeeVpa}
            onChange={(event) => {
              setPayeeVpa(event.target.value);
              setError("");
            }}
            placeholder={mode === "UPI ID" ? "receiver@rpay" : "Use a saved R-Pay receiver"}
          />
          <span className="mt-2 block text-xs font-semibold text-slate-500">{mode === "UPI ID" ? "Pay anyone using a sandbox UPI-style ID." : `${mode} mode uses saved R-Pay receivers.`}</span>
        </label>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Amount</span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-aqua">
              <span className="text-2xl font-bold text-slate-400">₹</span>
              <input
                className="min-w-0 flex-1 bg-transparent px-2 text-4xl font-extrabold tracking-normal outline-none"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
              />
            </div>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {[100, 500, 1000, 2000].map((value) => (
              <button key={value} type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700" onClick={() => setAmount(String(value))}>
                ₹{value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Note</span>
          <textarea className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-aqua" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What is this for?" />
        </label>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">HDFC Bank **** 4242</p>
            <p className="text-xs font-semibold text-slate-500">No platform fee · Sandbox transaction</p>
          </div>
        </div>
      </Card>

      <section>
        <p className="mb-3 text-sm font-semibold">Recent recipients</p>
        <div className="grid grid-cols-4 gap-3">
          {recentContacts.map((contact) => (
            <button key={contact.vpa} type="button" className="rounded-2xl bg-white p-3 text-center shadow-sm" onClick={() => setPayeeVpa(contact.vpa)}>
              <ContactAvatar name={contact.name} tone={contact.tone} />
              <span className="mt-2 block truncate text-xs font-bold">{contact.name}</span>
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

      <SafetyBanner>No real money moves in this simulation. Verify receiver before confirming.</SafetyBanner>

      <Button className="w-full" type="submit">
        <Send size={18} aria-hidden />
        Continue
      </Button>
    </form>
  );
}
