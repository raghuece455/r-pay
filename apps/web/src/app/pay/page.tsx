import { ConsumerShell } from "../../components/consumer-shell";
import { PayForm } from "../../components/pay-form";
import { SafetyBanner } from "../../components/ui";

export default function PayPage() {
  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">R-Pay Transfer</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Pay anyone using UPI ID</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose a receiver, enter the amount, and verify before confirming the transaction.</p>
        </div>
        <SafetyBanner>Sandbox mode: no real money will move.</SafetyBanner>
        <PayForm />
      </div>
    </ConsumerShell>
  );
}
