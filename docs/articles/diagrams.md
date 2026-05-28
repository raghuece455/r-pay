# Diagrams for the R-Pay Article Series

These diagrams are duplicated or expanded from the three articles so they can be reused in Medium, slides, or social posts.

## Part 1: R-Pay High-Level Architecture

```mermaid
flowchart LR
  User["Consumer user"] --> Web["Next.js consumer app"]
  Engineer["On-call engineer"] --> Ops["IncidentDesk"]
  Web --> API["Express API"]
  Ops --> API
  API --> DB[("PostgreSQL / Prisma")]
  Worker["Reconciler worker"] --> DB
  API --> Switch["UPI Switch Simulator"]
  Worker --> Switch
  API --> Telemetry["Metrics, logs, traces"]
  Worker --> Telemetry
  Telemetry --> Ops
```

## Part 1: Claude Code Build Workflow

```mermaid
flowchart LR
  Idea["Idea"] --> Interview["Product interview"]
  Interview --> Docs["Specs and design docs"]
  Docs --> Slice["Small vertical slice"]
  Slice --> Verify["Tests and manual checks"]
  Verify --> Memory["Update CLAUDE.md"]
  Memory --> Next["Next slice"]
```

## Part 1: Payment State Machine

```mermaid
stateDiagram-v2
  [*] --> CREATED
  CREATED --> PROCESSING
  PROCESSING --> SUCCESS: confirmed
  PROCESSING --> FAILED: failure reason
  PROCESSING --> PENDING: needs confirmation
  PROCESSING --> TIMED_OUT: no response
  PENDING --> SUCCESS: confirmed later
  PENDING --> FAILED: failed later
  PENDING --> TIMED_OUT: retry budget exhausted
  TIMED_OUT --> RECONCILED: later evidence found
  FAILED --> RECONCILED: reconciliation note
  SUCCESS --> RECONCILED: settlement/audit reconciliation
```

## Part 1: Consumer Payment Flow

```mermaid
sequenceDiagram
  participant User
  participant Web as Next.js App
  participant API as Express API
  participant DB as PostgreSQL
  participant Switch as UPI Switch Simulator

  User->>Web: Enter UPI ID and amount
  Web->>API: POST /api/payments with Idempotency-Key
  API->>DB: Create payment and audit log
  API->>DB: Transition CREATED -> PROCESSING
  API->>Switch: Request payment result
  Switch-->>API: SUCCESS, FAILED, or PENDING
  API->>DB: Store attempt and state change
  API-->>Web: Payment response
  Web-->>User: Status screen
```

## Part 2: Claude Memory and Extension Hierarchy

```mermaid
flowchart TD
  Chat["Current chat context"] --> ClaudeMd["CLAUDE.md project memory"]
  ClaudeMd --> Rules["Project rules"]
  Rules --> Skills["Skills for repeat workflows"]
  Skills --> Hooks["Hooks for safety gates"]
  Hooks --> Subagents["Subagents for focused analysis"]
  Subagents --> Teams["Agent teams for parallel work"]
```

## Part 2: Hooks as Safety Gates

```mermaid
flowchart LR
  Edit["Claude edits payment code"] --> Hook["Hook runs checks"]
  Hook --> Tests["pnpm test"]
  Hook --> Secrets["secret scan"]
  Hook --> State["state machine test required"]
  Tests --> Decision{"Checks pass?"}
  Secrets --> Decision
  State --> Decision
  Decision -->|Yes| Done["Task can finish"]
  Decision -->|No| Block["Fix or ask human"]
```

## Part 2: IncidentDesk Observability Pipeline

```mermaid
flowchart LR
  API["Payment API"] --> Metrics["Metrics"]
  API --> Logs["Logs"]
  API --> Traces["Traces"]
  Worker["Status Reconciler"] --> Metrics
  Worker --> Logs
  Worker --> Traces
  Switch["UPI Switch Simulator"] --> Metrics
  Metrics --> Desk["IncidentDesk"]
  Logs --> Desk
  Traces --> Desk
  Deploys["Deployment history"] --> Desk
  Runbook["Runbooks"] --> Desk
  Desk --> Analysis["AI incident analysis"]
  Desk --> RCA["RCA draft"]
```

## Part 2: Subagents Around R-Pay

```mermaid
flowchart TD
  Lead["Main Claude Code session"] --> IC["incident-commander"]
  Lead --> Log["log-analyst"]
  Lead --> Trace["trace-analyst"]
  Lead --> Reliability["reliability-engineer"]
  Lead --> Release["release-manager"]
  Lead --> Security["security-reviewer"]
  Lead --> Test["test-engineer"]
  Lead --> Writer["postmortem-writer"]
  IC --> Report["Evidence-backed incident summary"]
  Log --> Report
  Trace --> Report
  Reliability --> Report
  Release --> Report
```

## Part 3: Retry Storm Failure Loop

```mermaid
flowchart TD
  Slow["UPI Switch Simulator becomes slow"] --> Poll["Status Reconciler polls every 1s"]
  Poll --> More["No jitter or retry budget"]
  More --> Queue["Queue depth explodes"]
  Queue --> DB["DB connection pool reaches 100%"]
  DB --> API["Payment API latency jumps"]
  API --> Pending["Users see PENDING payments"]
  Pending --> MoreChecks["More status checks"]
  MoreChecks --> Poll
```

## Part 3: Incident Investigation Flow

```mermaid
flowchart LR
  Alert["P1 alert"] --> Scope["Confirm impact"]
  Scope --> Metrics["Inspect metrics"]
  Metrics --> Logs["Inspect logs"]
  Logs --> Traces["Inspect traces"]
  Traces --> Deploy["Check deployments"]
  Deploy --> Code["Read retry code"]
  Code --> Hypothesis["Root-cause hypothesis"]
  Hypothesis --> Mitigation["Mitigation options"]
  Mitigation --> Approval["Human approval"]
  Approval --> Recovery["Recover and monitor"]
```

## Part 3: Rollback vs Hotfix Decision Tree

```mermaid
flowchart TD
  Incident["P1 payment incident"] --> Evidence{"Evidence points to recent worker release?"}
  Evidence -->|Yes| Impact{"Can rollback isolate worker without corrupting payments?"}
  Evidence -->|No| Investigate["Continue investigation"]
  Impact -->|Yes| Approval["Request human approval"]
  Impact -->|No| Hotfix["Prepare targeted hotfix"]
  Approval --> Rollback["Rollback worker release"]
  Rollback --> Monitor["Monitor 10 stable minutes"]
  Monitor --> Fix["Prepare permanent fix"]
```

## Part 3: Recovery and RCA Workflow

```mermaid
flowchart LR
  Mitigate["Mitigate retry storm"] --> Monitor["Watch stable metrics"]
  Monitor --> Fix["Deploy fixed retry behavior"]
  Fix --> Tests["Run tests and load checks"]
  Tests --> RCA["Generate RCA draft"]
  RCA --> Review["Human review"]
  Review --> Prevent["Prevention items"]
  Prevent --> Runbook["Update runbook"]
```
