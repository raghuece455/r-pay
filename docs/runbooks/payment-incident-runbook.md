# Payment Incident Runbook

Use this runbook for R-Pay payment success-rate drops, pending payment spikes, retry storms, payment network latency, DB pool saturation, or degraded payment service health.

![Runbooks](../../screenshots/ops-runbooks-final.png)

## First Five Minutes

1. Declare the incident.
2. Start read-only investigation.
3. Check success rate, p95 latency, pending count, queue depth, DB pool usage, and payment network latency.
4. Check recent deployments.
5. Preserve payment creation if safe.
6. Do not mark payments `SUCCESS` without payment network simulator confirmation.
7. Do not delete audit logs.

## Midnight Retry Storm Mitigation

1. Disable aggressive status polling.
2. Roll back the status reconciler worker if the latest release changed retry logic.
3. Increase status check interval temporarily.
4. Pause non-critical reconciliation jobs.
5. Keep payment creation API running if it is safe.

## Permanent Fix

1. Restore exponential backoff and jitter.
2. Add retry budget.
3. Add a circuit breaker for a slow UPI Switch Simulator.
4. Preserve idempotency.
5. Separate reconciliation pressure from user-facing payment APIs.
6. Add alerts for retry rate, queue depth, pending age, and DB pool saturation.
7. Add load tests for slow payment network behavior.

## Human Approval

Rollback and deployment-style actions require explicit approval in IncidentDesk. In the local demo, the approval modal asks the operator to type `APPROVE SIMULATION`.

## RCA

After mitigation, generate an RCA draft from the incident timeline, logs, traces, deployment evidence, and metric recovery.

![RCA draft](../../screenshots/ops-rca-final.png)

