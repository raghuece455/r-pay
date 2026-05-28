import { ConsumerShell } from "../../components/consumer-shell";
import { ScanSimulator } from "../../components/scan-simulator";

export default function ScanPage() {
  return (
    <ConsumerShell>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-slate-500">QR payment</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Scan & Pay</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use the sample QR to simulate a merchant checkout.</p>
        </div>
        <ScanSimulator />
      </div>
    </ConsumerShell>
  );
}
