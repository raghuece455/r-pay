# API Design

Base URL: `http://localhost:4000`

The API is for local sandbox use only. It does not call real payment networks.

## Consumer Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/api/me` | Current demo user |
| `GET` | `/api/accounts` | Demo bank account summary |
| `POST` | `/api/payments` | Create a payment |
| `GET` | `/api/payments/:id` | Read payment status |
| `GET` | `/api/transactions` | List transactions |
| `GET` | `/api/transactions/:id` | Read transaction receipt |

`POST /api/payments` requires an `Idempotency-Key` header. Reusing the same key returns the existing payment instead of creating a duplicate.

## Simulator Routes

The internal route names include `mock-upi` because they are local-only simulator endpoints. They are not real UPI APIs.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/mock-upi/pay` | Return a local payment network response |
| `POST` | `/api/mock-upi/status` | Re-process or reconcile payment status |
| `POST` | `/api/mock-upi/preview` | Create a preview response for QR/pay flows |

## Ops Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/ops/metrics` | Latest payment health snapshot |
| `GET` | `/api/ops/incidents` | List incidents |
| `POST` | `/api/ops/incidents` | Declare incident |
| `GET` | `/api/ops/incidents/:id` | Incident detail |
| `POST` | `/api/ops/incidents/:id/timeline` | Add timeline event |
| `GET` | `/api/ops/deployments` | Deployment history |
| `GET` | `/api/ops/logs` | Operational logs |
| `GET` | `/api/ops/traces` | Trace spans |
| `GET` | `/api/ops/runbooks` | Runbook list |
| `POST` | `/api/ops/simulations/midnight-retry-storm` | Trigger incident simulation |
| `POST` | `/api/ops/simulations/recover` | Record recovery-style mitigation |
| `POST` | `/api/ops/rca/generate` | Generate RCA draft from local evidence |

## Screenshot

![Logs and traces](../../screenshots/ops-logs-final.png)

