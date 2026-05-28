import { ConsumerShell } from "../components/consumer-shell";
import { LoadingState } from "../components/ui";

export default function HomeLoading() {
  return (
    <ConsumerShell>
      <div className="space-y-5">
        <LoadingState label="Loading your account..." />
        <LoadingState label="Fetching transactions..." />
      </div>
    </ConsumerShell>
  );
}
