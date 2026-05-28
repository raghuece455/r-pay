import { clsx } from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Landmark,
  LifeBuoy,
  ShieldCheck,
  Siren,
  XCircle
} from "lucide-react";
import { formatInr, formatTime } from "../lib/format";
import type { Payment } from "../lib/api";
import { displayReference, serviceDisplayName } from "../lib/display";
import { RcaActions } from "./rca-actions";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-xl border border-slate-900/10 bg-white shadow-sm shadow-slate-900/5", className)} {...props} />;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" }) {
  const styles = {
    primary: "bg-midnight text-white shadow-lg shadow-midnight/20 hover:bg-indigo",
    secondary: "bg-aqua text-slate-950 shadow-lg shadow-aqua/20 hover:bg-aqua/85",
    danger: "bg-danger text-white shadow-lg shadow-danger/20 hover:bg-red-600",
    ghost: "bg-transparent text-ink hover:bg-slate-900/5",
    outline: "border border-slate-900/10 bg-white text-ink hover:bg-slate-50"
  };

  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" | "info" }) {
  const styles = {
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-800",
    neutral: "bg-slate-100 text-slate-700",
    info: "bg-cyan-100 text-cyan-800"
  };

  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", styles[tone])}>{children}</span>;
}

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e8fff9_0,#fbf7ef_34%,#f7efe1_100%)]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fffdf8] shadow-2xl shadow-slate-950/10 md:my-5 md:min-h-[860px] md:overflow-hidden md:rounded-[2rem] md:border md:border-white">
        {children}
      </div>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}

export function ConsumerTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/8 bg-[#fffdf8]/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid size-11 place-items-center rounded-2xl bg-midnight text-aqua shadow-lg shadow-midnight/20">
            <Landmark size={22} aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-normal">R-Pay</span>
            <span className="block text-xs font-semibold text-slate-500">Raghu&apos;s Pay</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="grid size-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-700 shadow-sm" aria-label="Notifications">
            <span className="relative block size-2 rounded-full bg-danger" />
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-midnight to-plum text-sm font-bold text-white">RJ</span>
        </div>
      </div>
    </header>
  );
}

export function BalanceCard({ balance, account, vpa }: { balance: number; account: string; vpa: string }) {
  return (
    <section className="relative overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,#101a3f_0%,#172554_48%,#23547b_100%)] p-5 text-white shadow-2xl shadow-midnight/30">
      <div className="absolute -right-12 -top-12 size-36 rounded-full bg-aqua/20" />
      <div className="absolute -bottom-16 left-12 size-40 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Available balance</p>
            <p className="mt-2 text-4xl font-extrabold tracking-normal">{formatInr(balance)}</p>
          </div>
          <span className="rounded-full bg-aqua px-3 py-1 text-xs font-bold text-slate-950">Secured</span>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{account}</p>
              <p className="mt-1 text-xs text-white/65">Bank account ending 4242</p>
            </div>
            <ShieldCheck size={22} className="text-aqua" aria-hidden />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-xs text-white/60">UPI ID</span>
            <span className="text-sm font-bold">{vpa}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickActionCard({ href, label, icon, tone = "aqua" }: { href: string; label: string; icon: ReactNode; tone?: "aqua" | "indigo" | "amber" | "plum" }) {
  const styles = {
    aqua: "bg-aqua/15 text-midnight ring-aqua/30",
    indigo: "bg-indigo/10 text-indigo ring-indigo/20",
    amber: "bg-amber/15 text-amber ring-amber/25",
    plum: "bg-plum/10 text-plum ring-plum/20"
  };

  return (
    <Link href={href} className="rounded-2xl border border-slate-900/8 bg-white p-3 text-center shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <span className={clsx("mx-auto grid size-12 place-items-center rounded-2xl ring-1", styles[tone])}>{icon}</span>
      <span className="mt-2 block text-xs font-semibold leading-tight text-slate-800">{label}</span>
    </Link>
  );
}

export function ContactAvatar({ name, tone = "indigo", size = "md" }: { name: string; tone?: "indigo" | "aqua" | "amber" | "plum" | "danger"; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const tones = {
    indigo: "from-midnight to-indigo text-white",
    aqua: "from-aqua to-emerald text-slate-950",
    amber: "from-amber to-orange-400 text-slate-950",
    plum: "from-plum to-indigo text-white",
    danger: "from-danger to-red-700 text-white"
  };
  const sizes = { sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-16 text-lg" };

  return <span className={clsx("grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-bold shadow-sm", tones[tone], sizes[size])}>{initials || "RP"}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === "SUCCESS" || status === "RECONCILED" ? "good" : status === "FAILED" || status === "TIMED_OUT" ? "bad" : status === "PENDING" || status === "PROCESSING" ? "warn" : "neutral";
  return <StatusPill tone={tone}>{status}</StatusPill>;
}

export function TransactionRow({ payment, href }: { payment: Payment; href: string }) {
  const avatarTone = payment.status === "SUCCESS" ? "aqua" : payment.status === "FAILED" ? "danger" : "amber";
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-slate-900/8 bg-white p-3 shadow-sm transition hover:border-indigo/25 hover:shadow-lg">
      <ContactAvatar name={payment.payeeVpa} tone={avatarTone} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{payment.payeeVpa}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{payment.note || "R-Pay transfer"}</span>
        <span className="mt-1 block text-[11px] font-semibold text-slate-400">{formatTime(payment.createdAt)}</span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-extrabold">{formatInr(payment.amount)}</span>
        <span className="mt-1 block">
          <StatusBadge status={payment.status} />
        </span>
      </span>
    </Link>
  );
}

export function Timeline({ items, dark = false }: { items: Array<{ title: string; meta?: string; body?: string }>; dark?: boolean }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className={clsx("relative pl-6", dark ? "text-zinc-200" : "text-slate-800")}>
          <span className={clsx("absolute left-0 top-1.5 size-3 rounded-full ring-4", dark ? "bg-aqua ring-aqua/10" : "bg-indigo ring-indigo/10")} />
          {index !== items.length - 1 ? <span className={clsx("absolute left-[5px] top-5 h-[calc(100%+0.5rem)] w-px", dark ? "bg-white/10" : "bg-slate-200")} /> : null}
          <p className="text-sm font-semibold">{item.title}</p>
          {item.body ? <p className={clsx("mt-1 text-sm leading-6", dark ? "text-zinc-400" : "text-slate-500")}>{item.body}</p> : null}
          {item.meta ? <p className={clsx("mt-1 text-xs font-semibold", dark ? "text-zinc-500" : "text-slate-400")}>{item.meta}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">{icon ?? <FileText size={22} aria-hidden />}</div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading secure payment data..." }: { label?: string }) {
  return <div className="animate-pulse rounded-2xl border border-slate-900/8 bg-white p-5 text-sm font-bold text-slate-500">{label}</div>;
}

export function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}

export function Sparkline({ values, color = "#26d7c4", height = 42 }: { values: number[]; color?: string; height?: number }) {
  const width = 140;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="h-[42px] w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={points} />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  threshold,
  values,
  tone = "good"
}: {
  label: string;
  value: string;
  delta: string;
  threshold: string;
  values: number[];
  tone?: "good" | "warn" | "bad" | "info";
}) {
  const colors = { good: "#10b981", warn: "#f59e0b", bad: "#ef4444", info: "#26d7c4" };
  const bg = { good: "border-emerald-400/20", warn: "border-amber-400/25", bad: "border-red-400/25", info: "border-cyan-400/25" };

  return (
    <div className={clsx("rounded-2xl border bg-white/[0.04] p-4 shadow-lg shadow-black/10", bg[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <span className={clsx("rounded-full px-2 py-1 text-xs font-black", tone === "bad" ? "bg-red-400/10 text-red-200" : tone === "warn" ? "bg-amber-400/10 text-amber-100" : "bg-emerald-400/10 text-emerald-100")}>
          {delta}
        </span>
      </div>
      <div className="mt-3">
        <Sparkline values={values} color={colors[tone]} />
      </div>
      <p className="mt-2 text-xs font-semibold text-zinc-500">Threshold: {threshold}</p>
    </div>
  );
}

export function SparklineCard({ title, values, value, tone = "info" }: { title: string; values: number[]; value: string; tone?: "good" | "warn" | "bad" | "info" }) {
  return <MetricCard label={title} value={value} delta="trend" threshold="demo" values={values} tone={tone} />;
}

export function IncidentSeverityBadge({ severity }: { severity: string }) {
  const tone = severity === "SEV1" ? "bad" : severity === "SEV2" ? "warn" : "info";
  return <StatusPill tone={tone}>{severity}</StatusPill>;
}

export function WarRoomMessage({ actor, time, children, tone = "neutral" }: { actor: string; time: string; children: ReactNode; tone?: "neutral" | "warn" | "bad" | "good" }) {
  const border = { neutral: "border-white/10", warn: "border-amber-400/25", bad: "border-red-400/25", good: "border-emerald-400/25" };
  return (
    <div className={clsx("rounded-xl border bg-black/20 p-3", border[tone])}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {time} · {actor}
      </p>
      <p className="mt-1 text-sm leading-6 text-zinc-200">{children}</p>
    </div>
  );
}

export function RunbookChecklist({ steps, dark = false }: { steps: string[]; dark?: boolean }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li key={step} className={clsx("flex gap-3 rounded-xl p-3 text-sm", dark ? "bg-white/[0.04] text-zinc-200" : "bg-slate-50 text-slate-700")}>
          <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-xs font-black", dark ? "bg-aqua text-slate-950" : "bg-midnight text-white")}>{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function RcaPanel({ body, id }: { body?: string | null; id?: string }) {
  return (
    <div id={id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">RCA draft</h2>
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-aqua" aria-hidden />
          <RcaActions body={body} />
        </div>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm leading-6 text-zinc-300 ops-scrollbar">
        {body ?? "No RCA draft yet. Generate it after mitigation evidence is captured."}
      </pre>
    </div>
  );
}

export function StatusHero({ status, amount, receiver, reference, createdAt }: { status: string; amount: number; receiver: string; reference: string | null; createdAt: string }) {
  const config =
    status === "SUCCESS"
      ? { icon: CheckCircle2, title: "Payment successful", tone: "from-emerald to-aqua", text: "Payment network confirmation received." }
      : status === "FAILED" || status === "TIMED_OUT"
        ? { icon: XCircle, title: status === "TIMED_OUT" ? "Payment timed out" : "Payment failed", tone: "from-danger to-red-700", text: "Payment could not be completed. No real money moved in this sandbox." }
        : status === "RECONCILED"
          ? { icon: ShieldCheck, title: "Payment reconciled", tone: "from-midnight to-indigo", text: "Operational reconciliation is complete." }
          : { icon: Clock3, title: "Payment pending", tone: "from-amber to-orange-400", text: "Your payment is being confirmed with the payment network simulator." };
  const Icon = config.icon;

  return (
    <section className="overflow-hidden rounded-[1.4rem] bg-white shadow-xl shadow-slate-900/8">
      <div className={clsx("bg-gradient-to-br p-6 text-white", config.tone)}>
        <span className="grid size-20 place-items-center rounded-full bg-white/20 backdrop-blur">
          <Icon size={42} aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold">{config.title}</h1>
        <p className="mt-2 text-sm text-white/80">{config.text}</p>
        <p className="mt-5 text-5xl font-extrabold tracking-normal">{formatInr(amount)}</p>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <InfoRow label="Receiver" value={receiver} />
        <InfoRow label="Reference ID" value={displayReference(reference)} />
        <InfoRow label="Date and time" value={formatTime(createdAt)} />
        <InfoRow label="Bank account" value="HDFC Bank ending 4242" />
      </div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-bold text-slate-900">{value}</span>
    </div>
  );
}

export function SafetyBanner({ tone = "info", children }: { tone?: "info" | "warn" | "bad" | "good"; children: ReactNode }) {
  const styles = {
    info: "border-cyan-200 bg-cyan-50 text-cyan-950",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    bad: "border-red-200 bg-red-50 text-red-950",
    good: "border-emerald-200 bg-emerald-50 text-emerald-950"
  };
  const Icon = tone === "bad" ? XCircle : tone === "warn" ? AlertTriangle : tone === "good" ? CheckCircle2 : ShieldCheck;

  return (
    <div className={clsx("flex gap-3 rounded-2xl border p-3 text-sm font-semibold leading-6", styles[tone])}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export function OpsPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/15">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ServiceHealthGrid({ services }: { services: Array<{ name: string; status: "healthy" | "degraded" | "recovering"; detail: string }> }) {
  return (
    <div className="grid gap-3 2xl:grid-cols-2">
      {services.map((service) => (
        <div key={service.name} className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm font-bold leading-tight text-zinc-100 md:whitespace-nowrap">{serviceDisplayName(service.name)}</p>
            <StatusPill tone={service.status === "healthy" ? "good" : service.status === "degraded" ? "bad" : "warn"}>{service.status}</StatusPill>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-400">{service.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function DeltaIcon({ direction }: { direction: "up" | "down" }) {
  return direction === "up" ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />;
}

export function ReceiptActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline">
        <Download size={17} aria-hidden />
        Share receipt
      </Button>
      <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white" href="/support">
        <LifeBuoy size={17} aria-hidden />
        Report issue
      </Link>
    </div>
  );
}

export function IncidentBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-red-50">
      <div className="flex gap-3">
        <Siren size={20} className="mt-0.5 shrink-0 text-red-300" aria-hidden />
        <div className="text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}
