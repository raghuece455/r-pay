import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

type LogInput = {
  level?: "INFO" | "WARN" | "ERROR";
  service: string;
  message: string;
  traceId?: string;
  paymentId?: string;
  incidentId?: string;
  metadata?: Record<string, unknown>;
};

export async function writeOpsLog(input: LogInput) {
  return prisma.opsLog.create({
    data: {
      level: input.level ?? "INFO",
      service: input.service,
      message: input.message,
      traceId: input.traceId,
      paymentId: input.paymentId,
      incidentId: input.incidentId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
    }
  });
}

export async function writeTraceSpan(input: {
  traceId: string;
  spanName: string;
  service: string;
  durationMs: number;
  status?: string;
  paymentId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.traceSpan.create({
    data: {
      traceId: input.traceId,
      spanName: input.spanName,
      service: input.service,
      durationMs: input.durationMs,
      status: input.status ?? "OK",
      paymentId: input.paymentId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
    }
  });
}
