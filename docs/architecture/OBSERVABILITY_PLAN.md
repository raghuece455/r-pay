# Observability Plan

R-Pay emits fake but realistic operational signals for demo use. These signals make the Midnight Retry Storm feel like a real production incident without touching real payment infrastructure.

## Metrics

IncidentDesk tracks:

- Payment success rate.
- Failure rate.
- Pending payment count.
- P95 latency.
- Reconciler queue depth.
- DB connection pool usage.
- Payment network latency.
- Retry rate.
- Service health state.

![IncidentDesk health](../../screenshots/ops-health-final.png)

## Logs

Logs include:

- Service name.
- Level.
- Human-readable event message.
- Trace ID.
- Transaction ID.
- Incident timing.
- Deployment correlation.

Log messages shown in the UI are sanitized and humanized. Internal event names remain available in expanded details for engineers.

![Logs and traces](../../screenshots/ops-logs-final.png)

## Traces

Trace spans model:

- User-facing payment API calls.
- Reconciler processing.
- UPI Switch Simulator calls.
- DB writes.
- Retry loops.

## Alerts

The Midnight Retry Storm creates an incident when:

- Success rate falls below the P1 threshold.
- P95 latency spikes.
- Pending payments rise quickly.
- DB pool usage reaches saturation.
- Reconciler queue depth exceeds the safe threshold.

## RCA Evidence

The RCA draft is generated from local incident evidence: metrics, deployment history, timeline entries, logs, traces, and the simulated root cause.

![RCA draft](../../screenshots/ops-rca-final.png)

