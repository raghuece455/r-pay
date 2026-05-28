# Social Posts for the R-Pay Article Series

## Series Announcement

### LinkedIn

I built R-Pay, a fictional UPI-style payment sandbox, to explain Claude Code agents through a real software lifecycle.

The series covers:

- building a payment app with Claude Code
- project memory with `CLAUDE.md`
- skills, hooks, subagents, and agent teams
- observability and runbooks
- a simulated midnight payment incident
- rollback, recovery, and RCA

The important bit: Claude helps investigate and prepare changes, but humans approve risky payment actions.

### X / Twitter

New series: Claude Agents in Action.

I built R-Pay, a fictional UPI-style payment sandbox, then broke it with a simulated midnight retry storm.

Part 1: build
Part 2: prepare incident response
Part 3: investigate, recover, RCA

No hype. Just engineering.

### Short Medium Teaser

What happens when you use Claude Code not as a chatbot, but as an engineering partner across build, incident response, and RCA? R-Pay is the running example.

## Part 1 Posts

### LinkedIn

The most dangerous prompt is: "Build me a payment app."

For R-Pay, I used Claude Code differently:

1. interview first
2. write practical docs
3. design the payment state machine
4. implement one vertical slice
5. require idempotency
6. write audit logs
7. test high-risk behavior

Part 1 shows how to build a fictional UPI-style payment sandbox without pretending payment systems are simple.

### X / Twitter

Bad prompt: "Build me a payment app."

Better prompt:
"Interview me, design the state machine, define idempotency, write API contracts, implement one slice, and test it."

That is how R-Pay started.

### Medium Preview

In Part 1, we build R-Pay's first payment slice: create payment, call the UPI Switch Simulator, store transaction, show status, and list history.

## Part 2 Posts

### LinkedIn

The worst time to teach Claude your system is during an incident.

Part 2 of the R-Pay series covers:

- `CLAUDE.md` project memory
- payment safety rules
- incident skills
- hooks as safety gates
- focused subagents
- when agent teams are worth it
- IncidentDesk for metrics, logs, traces, deployments, and runbooks

The goal is not autonomous production magic. The goal is safer engineering help.

### X / Twitter

My Claude Code rule of thumb:

Remember project rules -> `CLAUDE.md`
Repeat workflow -> skill
Enforce safety -> hook
Investigate focused area -> subagent
Compare hypotheses -> agent team
Risky production action -> human approval

### Medium Preview

Part 2 turns R-Pay from a working app into an incident-ready system with memory, runbooks, telemetry, subagents, and approval gates.

## Part 3 Posts

### LinkedIn

The Midnight Retry Storm:

- success rate dropped from 99.2% to 91.4%
- p95 latency jumped from 280 ms to 4.8 s
- pending payments increased 8x
- DB pool hit 100%
- retry rate exploded

Root cause: a worker release replaced backoff and jitter with fixed 1-second polling.

Claude helped investigate logs, traces, deployments, and code. Humans approved rollback.

### X / Twitter

The database was screaming, but it was not the root cause.

The real cause was retry logic:
slow payment network simulator + 1s polling + no jitter + no retry budget = retry storm.

Part 3 is the R-Pay midnight outage story.

### Medium Preview

Part 3 follows a simulated P1 payment incident from alert to rollback, recovery, permanent fix, and RCA. Claude helps. Humans stay in charge.
