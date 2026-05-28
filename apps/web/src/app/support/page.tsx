import { ConsumerShell } from "../../components/consumer-shell";
import { SupportForm } from "../../components/support-form";
import { apiGet, type Payment } from "../../lib/api";

export default async function SupportPage() {
  const transactions = await apiGet<Payment[]>("/api/transactions", []);

  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Payment help</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Report a payment issue</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Select a transaction and create a support ticket for the incident workflow.</p>
        </div>
        <SupportForm transactions={transactions} />
      </div>
    </ConsumerShell>
  );
}
