import { OpsShell } from "../../../components/ops-shell";
import { RunbookBrowser } from "../../../components/runbook-browser";
import { apiGet } from "../../../lib/api";

type Runbook = {
  id: string;
  title: string;
  slug: string;
  body: string;
};

export default async function RunbooksPage() {
  const runbooks = await apiGet<Runbook[]>("/api/ops/runbooks", []);

  return (
    <OpsShell>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">response playbooks</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Runbooks</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Payment-specific operational steps for success-rate degradation, retry storms, and safe recovery. These are demo runbooks for the R-Pay sandbox environment.
          </p>
        </header>
        <RunbookBrowser runbooks={runbooks} />
      </div>
    </OpsShell>
  );
}
