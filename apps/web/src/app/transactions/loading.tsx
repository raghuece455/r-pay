import { ConsumerShell } from "../../components/consumer-shell";
import { LoadingState } from "../../components/ui";

export default function TransactionsLoading() {
  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Payment ledger</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Transaction history</h1>
        </div>
        <LoadingState label="Loading transactions..." />
      </div>
    </ConsumerShell>
  );
}
