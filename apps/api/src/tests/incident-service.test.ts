import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma";
import { generateRca, simulateMidnightRetryStorm } from "../services/ops-service";

const maybeDescribe = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

maybeDescribe("incident simulation", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates Midnight Retry Storm evidence and an RCA draft", async () => {
    const incident = await simulateMidnightRetryStorm();
    const rca = await generateRca(incident.id);

    expect(incident.title).toBe("The Midnight Retry Storm");
    expect(incident.investigationSummary).toContain("retry storm");
    expect(rca.body).toContain("fixed 1-second polling");
    expect(rca.body).toContain("No real UPI APIs");
  });
});
