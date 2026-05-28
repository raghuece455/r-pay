# References for the R-Pay Article Series

These sources support the Claude agent concepts, incident response practices, observability framing, and high-level UPI context used in the series.

The R-Pay implementation itself is the source of truth for product behavior, screenshots, API routes, payment states, retry simulation, IncidentDesk screens, and RCA content.

## Anthropic Agent Guidance

- [Building Effective Agents - Anthropic Engineering](https://www.anthropic.com/engineering/building-effective-agents)
  - Use for workflow vs agent framing and the advice to start simple before adding complex agent systems.

## Claude Code Docs

- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
  - Use for Claude Code context, tool use, and how Claude works with project files and session context.

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
  - Use for `CLAUDE.md`, project memory, auto memory, and rules.

- [Create custom subagents](https://code.claude.com/docs/en/subagents)
  - Use for subagent concepts, role isolation, project-level subagents, and focused delegation.

- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
  - Use for agent teams, comparison with subagents, coordination overhead, and experimental status.

- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)
  - Use for hook lifecycle and automation patterns.

- [Hooks reference](https://code.claude.com/docs/en/hooks)
  - Use for hook configuration details and hook scope.

- [Extend Claude with skills](https://code.claude.com/docs/en/slash-commands)
  - Use for skills, `SKILL.md`, reusable workflows, and when to use skills instead of long `CLAUDE.md` content.

- [Extend Claude Code](https://code.claude.com/docs/en/features-overview)
  - Use for high-level comparison of `CLAUDE.md`, skills, subagents, hooks, MCP, plugins, and agent teams.

## Agent SDK and Managed Agents

- [Claude Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
  - Use for custom agent workflows built on Claude Code-style agent infrastructure.

- [Claude Managed Agents blog announcement](https://claude.com/blog/claude-managed-agents)
  - Use for hosted agent infrastructure positioning.

- [What is Claude Managed Agents?](https://claude.com/resources/tutorials/what-is-claude-managed-agents)
  - Use for examples of persistent memory, multi-agent incident response, and human-in-the-loop approval.

## AWS Incident Response, Runbooks, and Observability

- [AWS Well-Architected Operational Excellence: Operate](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operate.html)
  - Use for runbooks, playbooks, operational health, and observability framing.

- [AWS Systems Manager Incident Manager](https://aws.amazon.com/systems-manager/features/incident-manager/)
  - Use for response plans, chat channels, runbooks, metrics, timelines, and post-incident analysis patterns.

- [Using Systems Manager Automation runbooks with Incident Manager](https://docs.aws.amazon.com/incident-manager/latest/userguide/tutorials-runbooks.html)
  - Use for runbook automation concepts and approval-aware remediation patterns.

- [Develop runbooks and response plans for Incident Detection and Response](https://docs.aws.amazon.com/IDR/latest/userguide/idr-workloads-dev-runbook.html)
  - Use for incident response runbook planning.

- [Choosing an AWS monitoring and observability service](https://docs.aws.amazon.com/decision-guides/latest/monitoring-on-aws-how-to-choose/monitoring-on-aws-how-to-choose.html)
  - Use for metrics, logs, traces, CloudWatch, X-Ray, and OpenTelemetry-style observability.

- [Amazon CloudWatch FAQs](https://aws.amazon.com/cloudwatch/faqs/)
  - Use for CloudWatch logs, metrics, traces, and OpenTelemetry compatibility context.

## UPI High-Level Context

- [NPCI Unified Payments Interface product overview](https://www.npci.org.in/what-we-do/upi/product-overview)
  - Use only for high-level UPI context.
  - Do not use this source to imply R-Pay is connected to real UPI systems.

## R-Pay Local Source of Truth

- `README.md`
- `CLAUDE.md`
- `docs/architecture/SPEC.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/DATA_MODEL.md`
- `docs/architecture/API_DESIGN.md`
- `docs/architecture/PAYMENT_STATE_MACHINE.md`
- `docs/architecture/OBSERVABILITY_PLAN.md`
- `docs/runbooks/payment-incident-runbook.md`
- `apps/web`
- `apps/api`
- `apps/worker`
- `packages/shared`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `scripts`
- final screenshots in `screenshots/`

## Citation Notes

- Avoid current UPI volume or adoption statistics unless verified at publication time.
- Avoid claiming that R-Pay is compliant with real payment regulations.
- Avoid claiming the local AI incident analysis panel calls Claude. In this repo, it is generated from local templates and simulated evidence.
- Use official Claude docs for product behavior because Claude Code, Agent SDK, and Managed Agents change over time.
