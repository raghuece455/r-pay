import { CheckCircle2, ShieldAlert } from "lucide-react";

const evidence = [
  "Success rate dropped from 99.2% to 91.4%",
  "P95 latency increased from 280 ms to 4.8 s",
  "Pending transactions increased 8x",
  "DB connection pool reached 100%",
  "Queue depth exceeded safe threshold"
];

export function AiIncidentAnalysis() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/15">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">AI incident analysis</h2>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100">Confidence: High</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Current hypothesis</p>
          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Status reconciler retry behavior is creating a retry storm while the UPI switch simulator is slow.
          </p>
        </div>
        <div className="rounded-xl bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Recommended mitigation</p>
          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Rollback the status reconciler release, keep payment creation online, and monitor recovery for 10 stable minutes.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Evidence</p>
          <div className="mt-3 grid gap-2">
            {evidence.map((item) => (
              <p key={item} className="flex gap-2 text-sm text-zinc-200">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-aqua" aria-hidden />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="flex gap-2 text-sm font-bold text-amber-50">
            <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden />
            Human approval
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-50/85">Rollback and deployment actions require explicit approval.</p>
        </div>
      </div>
    </div>
  );
}
