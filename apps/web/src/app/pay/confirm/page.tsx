import { ConsumerShell } from "../../../components/consumer-shell";
import { ConfirmPayment } from "../../../components/confirm-payment";

export default async function ConfirmPage({
  searchParams
}: {
  searchParams: Promise<{ payeeVpa?: string; amount?: string; note?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const payeeVpa = resolvedSearchParams.payeeVpa ?? "chai-shop@rpay";
  const amount = Number(resolvedSearchParams.amount ?? 150);
  const note = resolvedSearchParams.note ?? "";

  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Final review</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Confirm payment</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Verify receiver and amount before confirming the payment.</p>
        </div>
        <ConfirmPayment payeeVpa={payeeVpa} amount={amount} note={note} />
      </div>
    </ConsumerShell>
  );
}
