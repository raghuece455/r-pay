# R-Pay Project Memory

R-Pay is a fictional UPI-style payment product for India. It is also called Raghu's Pay.

## Safety Boundary

- Do not use real UPI APIs, bank APIs, NPCI credentials, PSP APIs, PhonePe APIs, Google Pay APIs, Paytm APIs, BHIM APIs, payment gateway APIs, or real money movement.
- Do not copy real payment app UI, logos, colors, layouts, screenshots, or assets.
- Use only the local sandbox payment network simulator in this repo.
- Treat payment code as high-risk.
- Every payment creation must require an idempotency key.
- Duplicate idempotency keys must not create duplicate transactions.
- Payment transitions must go through the shared state machine.
- Do not mark a payment `SUCCESS` without simulator confirmation.
- Do not delete audit logs.
- Any production-like deployment, rollback, or payment-state correction requires human approval.

## Engineering Rules

- Shared payment states and validation live in `packages/shared`.
- API routes live in `apps/api`.
- Worker retry behavior lives in `apps/worker`.
- UI routes live in `apps/web/src/app`.
- UI display sanitization lives in `apps/web/src/lib/display.ts`.
- Final screenshots live in `screenshots/*-final.png`.
- Run tests after changing payment state logic, idempotency, simulator behavior, incident simulation, RCA generation, or approval-gated recovery actions.

## Local Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Seed: `pnpm seed`
- Incident: `pnpm simulate:incident`
- Reset: `pnpm reset:demo`

