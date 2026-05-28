import { DeploymentsTable } from "../../../components/deployments-table";
import { OpsShell } from "../../../components/ops-shell";
import { apiGet } from "../../../lib/api";
import { augmentedDeployments } from "../../../lib/demo-data";

type Deployment = {
  id: string;
  version: string;
  service: string;
  status: string;
  deployedBy: string;
  summary: string;
  mode: string;
  deployedAt: string;
};

export default async function DeploymentsPage() {
  const deployments = augmentedDeployments(await apiGet<Deployment[]>("/api/ops/deployments", []));

  return (
    <OpsShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua">release evidence</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Deployment history</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Correlate worker releases with payment health. High-risk rollback actions require explicit approval and run only against this local simulation.
            </p>
          </div>
        </header>
        <DeploymentsTable deployments={deployments} />
      </div>
    </OpsShell>
  );
}
