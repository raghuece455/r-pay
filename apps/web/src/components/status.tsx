import { StatusPill } from "./ui";

export function PaymentStatusPill({ status }: { status: string }) {
  const tone = status === "SUCCESS" || status === "RECONCILED" ? "good" : status === "FAILED" || status === "TIMED_OUT" ? "bad" : status === "PENDING" || status === "PROCESSING" ? "warn" : "neutral";
  return <StatusPill tone={tone}>{status}</StatusPill>;
}

export function OpsStatusPill({ status }: { status: string }) {
  const tone = status === "healthy" || status === "RESOLVED" ? "good" : status === "degraded" || status === "SEV1" ? "bad" : "warn";
  return <StatusPill tone={tone}>{status}</StatusPill>;
}
