import { displayOpsText } from "./display";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function apiPost<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(displayOpsText(await response.text()));
  }

  return (await response.json()) as T;
}

export type Account = {
  id: string;
  bankName: string;
  maskedNumber: string;
  accountType: string;
  balance: number;
  isPrimary: boolean;
};

export type Payment = {
  id: string;
  payerVpa: string;
  payeeVpa: string;
  amount: number;
  amountPaise: number;
  currency: string;
  note: string | null;
  idempotencyKey?: string;
  status: string;
  failureReason: string | null;
  mockSwitchRef: string | null;
  createdAt: string;
  updatedAt: string;
  attempts?: Array<{ id: string; attemptNo: number; status: string; latencyMs: number; createdAt: string }>;
  auditLogs?: Array<{ id: string; event: string; actor: string; createdAt: string; metadata: unknown }>;
};

export type MetricSnapshot = {
  successRate: number;
  failureRate: number;
  pendingCount: number;
  p95LatencyMs: number;
  queueDepth: number;
  dbPoolUsagePct: number;
  mockUpiLatencyMs: number;
  retryRate: number;
  serviceHealth: string;
  createdAt: string;
};

export type Incident = {
  id: string;
  incidentKey: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  summary: string;
  investigationSummary?: string | null;
  rootCause?: string | null;
  startedAt: string;
  resolvedAt?: string | null;
  timeline?: Array<{ id: string; actor: string; eventType: string; message: string; createdAt: string }>;
  rcaDrafts?: Array<{ id: string; title: string; body: string; createdAt: string }>;
};
