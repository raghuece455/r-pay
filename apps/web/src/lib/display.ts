const serviceNames: Record<string, string> = {
  "payment-api": "Payment API",
  "payment-worker": "Reconciler Worker",
  "status-reconciler": "Status Reconciler",
  "mock-upi-switch": "UPI Switch Simulator",
  "upi-switch-simulator": "UPI Switch Simulator",
  postgres: "PostgreSQL",
  redis: "Redis",
  "incident-api": "Incident API",
  worker: "Reconciler Worker"
};

export function serviceDisplayName(id: string) {
  return (
    serviceNames[id] ??
    id
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join(" ")
  );
}

export function displayReference(reference?: string | null) {
  if (!reference) return "Not assigned";
  return reference.replace(/^mock_sw_/i, "rpay_ref_");
}

export function displayOpsText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/Claude-style investigation summary/gi, "AI investigation summary")
    .replace(/Claude-style summary/gi, "AI incident analysis")
    .replace(/mock_upi_switch/gi, "upi_switch_simulator")
    .replace(/mock-upi-switch/gi, "UPI Switch Simulator")
    .replace(/mock UPI switch/gi, "UPI switch simulator")
    .replace(/mock switch/gi, "UPI switch simulator")
    .replace(/mock UPI latency/gi, "payment network latency")
    .replace(/mock UPI/gi, "payment network simulator")
    .replace(/mock payment/gi, "sandbox transaction")
    .replace(/mock transaction/gi, "sandbox transaction")
    .replace(/mock receipt/gi, "sandbox receipt")
    .replace(/mock confirmation/gi, "payment network confirmation")
    .replace(/mock data/gi, "demo data")
    .replace(/mock-only/gi, "sandbox-only")
    .replace(/\bmock\b/gi, "sandbox")
    .replace(/mock_sw_/gi, "rpay_ref_");
}

const eventNames: Record<string, string> = {
  retry_storm_detected: "Retry storm detected",
  payment_state_changed: "Payment state changed",
  "upi_switch_simulator.response": "UPI switch simulator response",
  "mock_upi_switch.response": "UPI switch simulator response",
  "mock_upi_switch.pay": "UPI switch simulator payment call"
};

export function eventDisplayName(value?: string | null) {
  const sanitized = displayOpsText(value);
  if (!sanitized) return "";
  const exact = eventNames[value ?? ""] ?? eventNames[sanitized];
  if (exact) return exact;
  if (!/[._-]/.test(sanitized)) return sanitized;

  return sanitized
    .replace(/[._-]+/g, " ")
    .replace(/\bupi\b/gi, "UPI")
    .replace(/\bdb\b/gi, "DB")
    .replace(/\bp95\b/gi, "P95")
    .replace(/\brca\b/gi, "RCA")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
