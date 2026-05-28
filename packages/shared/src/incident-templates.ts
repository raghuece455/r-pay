export function midnightRetryStormSummary(): string {
  return [
    "AI investigation summary:",
    "",
    "Read-only investigation found a retry storm in the status reconciler.",
    "Success rate dropped from 99.2% to 91.4%.",
    "P95 latency rose from 280 ms to 4.8 seconds.",
    "Pending payments increased 8x.",
    "DB connection pool reached 100%.",
    "The status reconciler queue depth exploded while the UPI switch simulator was slow.",
    "",
    "Likely root cause: release rpay-worker-2026.05.28-001 changed retry behavior from exponential backoff with jitter to fixed 1-second polling with no retry budget or circuit breaker.",
    "",
    "Recommended action: human-approved rollback of the status reconciler worker, temporarily increase status check interval, pause non-critical reconciliation jobs, keep payment creation running, then deploy fixed retry logic after tests pass."
  ].join("\n");
}

export function midnightRetryStormRca(): string {
  return [
    "# RCA Draft: Midnight Retry Storm",
    "",
    "## Summary",
    "",
    "R-Pay experienced a simulated payment incident where users saw payments stuck in PENDING. Payment success rate dropped from about 99.2% to 91.4%, P95 latency increased from about 280 ms to 4.8 seconds, pending transactions increased 8x, and DB pool usage reached 100%.",
    "",
    "## Root Cause",
    "",
    "A release changed the status reconciler retry logic from exponential backoff with jitter to fixed 1-second polling. When the UPI switch simulator became slow, the reconciler created a retry storm. The retry storm consumed DB connections and slowed user-facing payment APIs.",
    "",
    "## Immediate Mitigation",
    "",
    "- Disabled aggressive status polling.",
    "- Rolled back the status reconciler worker.",
    "- Increased status check interval temporarily.",
    "- Paused non-critical reconciliation jobs.",
    "- Kept payment creation API running.",
    "",
    "## Permanent Fix",
    "",
    "- Restore exponential backoff.",
    "- Restore jitter.",
    "- Add retry budget.",
    "- Add circuit breaker for slow UPI switch simulator.",
    "- Preserve idempotency.",
    "- Separate reconciliation pressure from user-facing payment API.",
    "- Add alerts for retry rate, queue depth, pending age, and DB pool saturation.",
    "",
    "## Safety Note",
    "",
    "No real UPI APIs or real money movement were involved. R-Pay is a fictional sandbox system."
  ].join("\n");
}
