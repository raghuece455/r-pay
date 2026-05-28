import Link from "next/link";
import { ConsumerShell } from "../../../components/consumer-shell";
import { Card, InfoRow, ReceiptActions, SafetyBanner, StatusBadge, StatusHero, Timeline } from "../../../components/ui";
import { apiGet, type Payment } from "../../../lib/api";
import { displayReference } from "../../../lib/display";
import { formatTime } from "../../../lib/format";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payment = await apiGet<Payment | null>(`/api/transactions/${resolvedParams.id}`, null);

  if (!payment) {
    return (
      <ConsumerShell>
        <Card className="p-5">
          <h1 className="text-xl font-bold">Transaction not found</h1>
        </Card>
      </ConsumerShell>
    );
  }

  return (
    <ConsumerShell>
      <div className="space-y-4">
        <StatusHero status={payment.status} amount={payment.amount} receiver={payment.payeeVpa} reference={payment.mockSwitchRef} createdAt={payment.createdAt} />

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Receipt details</h2>
            <StatusBadge status={payment.status} />
          </div>
          <div className="space-y-3 text-sm">
            <InfoRow label="Sender" value={payment.payerVpa} />
            <InfoRow label="Receiver" value={payment.payeeVpa} />
            <InfoRow label="Bank account" value="HDFC Bank ending 4242" />
            <InfoRow label="Reference ID" value={displayReference(payment.mockSwitchRef)} />
            <InfoRow label="Idempotency key" value={<span className="break-all font-mono text-xs">{payment.idempotencyKey}</span>} />
            <InfoRow label="Demo data" value="No real money moved" />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-bold">Payment attempts</h2>
          <div className="space-y-3">
            {(payment.attempts ?? []).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm font-bold">Attempt {attempt.attemptNo}</span>
                <span className="text-sm font-semibold text-slate-600">{attempt.status} · {attempt.latencyMs} ms</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 font-bold">Audit timeline</h2>
          <Timeline
            items={(payment.auditLogs ?? []).map((log) => ({
              title: log.event,
              body: log.actor,
              meta: formatTime(log.createdAt)
            }))}
          />
        </Card>

        <SafetyBanner>This sandbox receipt uses demo payment data for the R-Pay demo. It is not proof of a real UPI transfer.</SafetyBanner>

        <ReceiptActions />

        <Link className="block rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-center text-sm font-bold" href="/support">
          Report stuck or failed payment
        </Link>
      </div>
    </ConsumerShell>
  );
}
