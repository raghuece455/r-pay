import { OpsShell } from "../../../components/ops-shell";

export default function IncidentsLoading() {
  return (
    <OpsShell>
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 rounded-xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
      </div>
    </OpsShell>
  );
}
