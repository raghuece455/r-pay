import Link from "next/link";
import { ListTodo, ShieldCheck } from "lucide-react";
import { OpsNav } from "./ops-nav";

export function OpsShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#173152_0,#0b1018_36%,#070a0f_100%)] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-72 border-r border-white/10 bg-[#0f1620]/95 p-4 shadow-2xl shadow-black/30 md:block">
          <Link href="/ops" className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-aqua text-slate-950 shadow-lg shadow-aqua/20">
              <ListTodo size={22} aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-black">R-Pay IncidentDesk</span>
              <span className="block text-xs font-semibold text-zinc-400">production-sim</span>
            </span>
          </Link>
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm">
            <div className="flex items-center gap-2 font-bold text-emerald-100">
              <ShieldCheck size={16} aria-hidden />
              On-call: Raghu
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-400">Payment safety rules loaded. Human approval required for rollback and deploy actions.</p>
          </div>
          <OpsNav />
          <Link href="/" className="mt-8 block rounded-xl border border-white/10 px-3 py-2.5 text-sm font-bold text-zinc-300 hover:bg-white/10">
            Consumer app
          </Link>
        </aside>
        <section className="ops-scrollbar min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</section>
      </div>
    </main>
  );
}
