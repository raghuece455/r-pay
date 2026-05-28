import { OpsLogsBrowser } from "../../../components/ops-logs-browser";
import { OpsShell } from "../../../components/ops-shell";
import { apiGet } from "../../../lib/api";

type OpsLog = {
  id: string;
  level: string;
  service: string;
  message: string;
  traceId?: string | null;
  paymentId?: string | null;
  createdAt: string;
};

type TraceSpan = {
  id: string;
  traceId: string;
  spanName: string;
  service: string;
  durationMs: number;
  status: string;
  createdAt: string;
};

export default async function LogsPage() {
  const [logs, traces] = await Promise.all([
    apiGet<OpsLog[]>("/api/ops/logs", []),
    apiGet<TraceSpan[]>("/api/ops/traces", [])
  ]);

  return (
    <OpsShell>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">observability</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Logs and traces</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Filter incident evidence by service, level, transaction ID, request ID, and time range. Timeout, retry, and DB pool signals are highlighted for faster triage.
          </p>
        </header>
        <OpsLogsBrowser logs={logs} traces={traces} />
      </div>
    </OpsShell>
  );
}
