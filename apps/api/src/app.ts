import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createPaymentSchema, getMockUpiResponse, mockUpiPaySchema, timelineEventSchema } from "@rpay/shared";
import { errorHandler, asyncHandler } from "./lib/http";
import { config } from "./lib/config";
import { prisma } from "./lib/prisma";
import { getDemoUser } from "./services/demo-data";
import { createPayment, createMockSwitchPayment, getPayment, listTransactions, processPayment } from "./services/payment-service";
import {
  addTimelineEvent,
  createIncident,
  generateRca,
  getIncident,
  latestMetrics,
  listDeployments,
  listIncidents,
  listLogs,
  listRunbooks,
  listTraces,
  recoverFromIncident,
  simulateMidnightRetryStorm,
  simulateNormalTraffic
} from "./services/ops-service";

function routeParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing route parameter: ${name}`);
  }
  return value;
}

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", asyncHandler(async (_request, response) => {
    response.json({
      status: "ok",
      service: "rpay-api",
      mockOnly: true,
      timestamp: new Date().toISOString()
    });
  }));

  app.get("/api/me", asyncHandler(async (_request, response) => {
    const user = await getDemoUser();
    response.json(user);
  }));

  app.get("/api/accounts", asyncHandler(async (_request, response) => {
    const user = await getDemoUser();
    const accounts = await prisma.bankAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    response.json(accounts.map((account) => ({ ...account, balance: account.balancePaise / 100 })));
  }));

  app.post("/api/payments", asyncHandler(async (request, response) => {
    const idempotencyKey = request.header("Idempotency-Key") ?? undefined;
    const result = await createPayment(request.body, idempotencyKey, config.mockUpiMode);
    response.status(result.duplicate ? 200 : 201).json(result);
  }));

  app.get("/api/payments/:id", asyncHandler(async (request, response) => {
    response.json(await getPayment(routeParam(request.params.id, "id")));
  }));

  app.get("/api/transactions", asyncHandler(async (_request, response) => {
    response.json(await listTransactions());
  }));

  app.get("/api/transactions/:id", asyncHandler(async (request, response) => {
    response.json(await getPayment(routeParam(request.params.id, "id")));
  }));

  app.post("/api/mock-upi/pay", asyncHandler(async (request, response) => {
    const parsed = mockUpiPaySchema.parse(request.body);
    response.json(getMockUpiResponse(config.mockUpiMode, parsed.paymentId));
  }));

  app.post("/api/mock-upi/status", asyncHandler(async (request, response) => {
    const paymentId = String(request.body.paymentId ?? "");
    response.json(await processPayment(paymentId, config.mockUpiMode));
  }));

  app.get("/api/ops/metrics", asyncHandler(async (_request, response) => {
    response.json(await latestMetrics());
  }));

  app.get("/api/ops/incidents", asyncHandler(async (_request, response) => {
    response.json(await listIncidents());
  }));

  app.post("/api/ops/incidents", asyncHandler(async (request, response) => {
    response.status(201).json(await createIncident(request.body));
  }));

  app.get("/api/ops/incidents/:id", asyncHandler(async (request, response) => {
    response.json(await getIncident(routeParam(request.params.id, "id")));
  }));

  app.post("/api/ops/incidents/:id/timeline", asyncHandler(async (request, response) => {
    const parsed = timelineEventSchema.parse(request.body);
    response.status(201).json(await addTimelineEvent(routeParam(request.params.id, "id"), parsed));
  }));

  app.get("/api/ops/deployments", asyncHandler(async (_request, response) => {
    response.json(await listDeployments());
  }));

  app.get("/api/ops/logs", asyncHandler(async (_request, response) => {
    response.json(await listLogs());
  }));

  app.get("/api/ops/traces", asyncHandler(async (_request, response) => {
    response.json(await listTraces());
  }));

  app.get("/api/ops/runbooks", asyncHandler(async (_request, response) => {
    response.json(await listRunbooks());
  }));

  app.post("/api/ops/simulations/normal-traffic", asyncHandler(async (_request, response) => {
    response.json(await simulateNormalTraffic());
  }));

  app.post("/api/ops/simulations/midnight-retry-storm", asyncHandler(async (_request, response) => {
    response.json(await simulateMidnightRetryStorm());
  }));

  app.post("/api/ops/simulations/recover", asyncHandler(async (_request, response) => {
    response.json(await recoverFromIncident());
  }));

  app.post("/api/ops/rca/generate", asyncHandler(async (request, response) => {
    response.status(201).json(await generateRca(request.body?.incidentId));
  }));

  app.post("/api/mock-upi/preview", asyncHandler(async (request, response) => {
    const parsed = createPaymentSchema.parse(request.body);
    response.json(await createMockSwitchPayment(parsed));
  }));

  app.use(errorHandler);

  return app;
}
