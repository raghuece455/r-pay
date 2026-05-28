import Link from "next/link";
import { ArrowRight, Repeat2 } from "lucide-react";
import { ConsumerShell } from "../../../../components/consumer-shell";
import { Card, EmptyState, ReceiptActions, SafetyBanner, StatusHero, Timeline } from "../../../../components/ui";
import { apiGet, type Payment } from "../../../../lib/api";
import { formatTime } from "../../../../lib/format";
import { statusCopy } from "../../../../lib/demo-data";

export default async function PaymentStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payment = await apiGet<Payment | null>(`/api/payments/${resolvedParams.id}`, null);

  if (!payment) {
    return (
      <ConsumerShell>
        <Card className="p-5">
          <h1 className="text-xl font-bold">Payment not found</h1>
          <Link className="mt-4 inline-block text-sm font-bold text-plum" href="/transactions">
            Back to history
          </Link>
        </Card>
      </ConsumerShell>
    );
  }

  const timelineItems =
    payment.auditLogs?.map((log) => ({
      title: log.event,
      body: log.actor,
      meta: formatTime(log.createdAt)
    })) ?? [];

  return (
    <ConsumerShell>
      <div className="space-y-5">
        <StatusHero status={payment.status} amount={payment.amount} receiver={payment.payeeVpa} reference={payment.mockSwitchRef} createdAt={payment.createdAt} />

        <SafetyBanner tone={payment.status === "FAILED" || payment.status === "TIMED_OUT" ? "bad" : payment.status === "PENDING" ? "warn" : "good"}>
          {statusCopy(payment.status, payment.failureReason)}
        </SafetyBanner>

        <Card className="p-4">
          <h2 className="mb-4 text-lg font-bold">Transaction timeline</h2>
          {timelineItems.length > 0 ? <Timeline items={timelineItems} /> : <EmptyState title="No timeline yet" body="Audit events will appear here." />}
        </Card>

        <ReceiptActions />

        <div className="grid grid-cols-2 gap-3">
          <Link className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-900/10 bg-white px-4 text-sm font-bold" href={`/transactions/${payment.id}`}>
            View details
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link className="flex h-11 items-center justify-center gap-2 rounded-lg bg-midnight px-4 text-sm font-bold text-white" href="/pay">
            <Repeat2 size={16} aria-hidden />
            Try another
          </Link>
        </div>
      </div>
    </ConsumerShell>
  );
}
