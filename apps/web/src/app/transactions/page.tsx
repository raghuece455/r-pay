import { ConsumerShell } from "../../components/consumer-shell";
import { TransactionBrowser } from "../../components/transaction-browser";
import { apiGet, type Payment } from "../../lib/api";

export default async function TransactionsPage() {
  const transactions = await apiGet<Payment[]>("/api/transactions", []);

  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Payment ledger</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Transaction history</h1>
        </div>
        <TransactionBrowser transactions={transactions} />
      </div>
    </ConsumerShell>
  );
}
