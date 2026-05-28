"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Payment } from "../lib/api";
import { groupPaymentsByDate } from "../lib/demo-data";
import { EmptyState, SafetyBanner, TransactionRow } from "./ui";

const filters = ["All", "Success", "Pending", "Failed"];

export function TransactionBrowser({ transactions }: { transactions: Payment[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return transactions.filter((payment) => {
      const matchesQuery = `${payment.payeeVpa} ${payment.note ?? ""} ${payment.status}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        (filter === "Success" && payment.status === "SUCCESS") ||
        (filter === "Pending" && (payment.status === "PENDING" || payment.status === "PROCESSING")) ||
        (filter === "Failed" && (payment.status === "FAILED" || payment.status === "TIMED_OUT"));
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, transactions]);

  const groups = groupPaymentsByDate(filtered);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-900/8 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-slate-400" aria-hidden />
          <input className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" placeholder="Search receiver, note, or status" value={query} onChange={(event) => setQuery(event.target.value)} />
          <SlidersHorizontal size={18} className="text-slate-400" aria-hidden />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 rpay-scrollbar">
        {filters.map((item) => (
          <button key={item} type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? "bg-midnight text-white" : "bg-white text-slate-600 shadow-sm"}`} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      <SafetyBanner>Pull-to-refresh simulation: reload this page to fetch the latest payment history.</SafetyBanner>

      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
            {group.items.map((payment) => (
              <div key={payment.id} className={payment.status === "PENDING" ? "rounded-2xl ring-2 ring-amber/30" : ""}>
                <TransactionRow payment={payment} href={`/transactions/${payment.id}`} />
              </div>
            ))}
          </section>
        ))}
        {filtered.length === 0 ? <EmptyState title="No matching transactions" body="Try a different search or filter." /> : null}
        {transactions.length > 0 && filtered.length > 0 && filtered.length < 3 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm leading-6 text-slate-500">
            Showing a small payment sample for this local sandbox. Create a few more transfers to fill out the history view.
          </div>
        ) : null}
      </div>
    </div>
  );
}
