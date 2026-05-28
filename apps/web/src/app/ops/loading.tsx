import { OpsShell } from "../../components/ops-shell";

export default function OpsLoading() {
  return (
    <OpsShell>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-white/5" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-white/[0.04]" />
      </div>
    </OpsShell>
  );
}
