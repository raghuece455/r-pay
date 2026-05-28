# R-Pay Article Screenshot Map

All paths are relative to files in `docs/articles`.

## Consumer App Screenshots

| Screenshot | Use in article | Caption | Concept taught | Alt text | Required |
| --- | --- | --- | --- | --- | --- |
| `../../screenshots/rpay-home-final.png` | Part 1, after introducing R-Pay | R-Pay consumer home screen: a sandbox UPI-style payment app with balance, UPI ID, quick actions, contacts, and recent transactions. | A real product surface gives Claude concrete context. | R-Pay mobile home screen showing balance card, quick payment actions, contacts, and recent transactions. | Required |
| `../../screenshots/rpay-pay-final.png` | Part 1, vertical slice walkthrough | R-Pay payment screen: the first useful slice starts with receiver, amount, note, account, and confirmation. | Small vertical slices beat one giant prompt. | R-Pay pay screen with UPI ID input, amount chips, selected bank account, and continue button. | Required |
| `../../screenshots/rpay-status-final.png` | Part 1, state machine section | R-Pay payment status screen: user-facing status depends on validated state transitions and payment network confirmation. | State machines are product features, not backend trivia. | R-Pay payment status screen showing a successful payment with amount, receiver, reference ID, and timeline. | Required |
| `../../screenshots/rpay-transactions-final.png` | Part 1, audit and history section | R-Pay transaction history: every payment needs a durable story after the button click. | Transaction history, receipts, and support depend on stored payment facts. | R-Pay transaction history screen with status filters and grouped transaction rows. | Required |

## IncidentDesk Screenshots

| Screenshot | Use in article | Caption | Concept taught | Alt text | Required |
| --- | --- | --- | --- | --- | --- |
| `../../screenshots/ops-health-final.png` | Part 2 and Part 3 opening | IncidentDesk payment health dashboard: success rate, latency, queue depth, DB pool, and retry rate tell the incident story fast. | Good observability gives agents and humans shared facts. | Dark IncidentDesk dashboard with degraded payment health metrics, service health, active incident, and AI incident analysis. | Required |
| `../../screenshots/ops-incident-detail-final.png` | Part 3 incident command section | Incident detail view: timeline, evidence, responders, runbook checklist, decisions, and approval-gated actions in one place. | Incident response is coordination, not just log searching. | IncidentDesk detail page for the Midnight Retry Storm with timeline, evidence cards, runbook, and mitigation actions. | Required |
| `../../screenshots/ops-logs-final.png` | Part 2 observability section and Part 3 investigation | Logs and traces browser: the log analyst needs filters, patterns, trace IDs, transaction IDs, and expandable evidence. | Logs become useful when they are searchable and connected to traces. | IncidentDesk logs page showing filters, log entries, traces, and common incident patterns. | Required |
| `../../screenshots/ops-deployments-final.png` | Part 2 deployment history and Part 3 root cause | Deployment history: the suspicious worker release is visible next to the incident. | Deployment correlation often turns symptoms into a root-cause hypothesis. | IncidentDesk deployment history showing a high-risk status reconciler release linked to the Midnight Retry Storm. | Required |
| `../../screenshots/ops-runbooks-final.png` | Part 2 runbooks section | Runbook viewer: responders need practical steps before the incident starts, not after panic begins. | Runbooks make agent-assisted response repeatable and safer. | IncidentDesk runbook page showing payment success degradation steps and safety warnings. | Required |
| `../../screenshots/ops-rca-final.png` | Part 3 RCA section | RCA draft panel: a useful post-incident write-up starts from the timeline, evidence, mitigation, and prevention items. | Claude can help draft RCA, but humans own accuracy and accountability. | IncidentDesk RCA panel showing a structured root cause analysis draft for the Midnight Retry Storm. | Required |

## Optional Crops

If Medium layout feels crowded, create cropped versions later for:

- Metric cards from `ops-health-final.png`
- Approval modal from incident actions
- RCA summary section from `ops-rca-final.png`
- Transaction timeline from `rpay-status-final.png`

Do not crop away the sandbox or production-sim context. The reader should never mistake R-Pay for a real payment product.
