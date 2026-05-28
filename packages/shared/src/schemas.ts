import { z } from "zod";

export const upiStyleIdSchema = z
  .string()
  .trim()
  .min(5)
  .max(80)
  .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, "Use a fake UPI-style ID like raghu@rpay");

export const createPaymentSchema = z.object({
  payerVpa: upiStyleIdSchema,
  payeeVpa: upiStyleIdSchema,
  amount: z.number().positive().max(100000),
  currency: z.literal("INR").default("INR"),
  note: z.string().max(120).optional().default("")
});

export const mockUpiPaySchema = z.object({
  paymentId: z.string().min(1),
  payerVpa: upiStyleIdSchema,
  payeeVpa: upiStyleIdSchema,
  amountPaise: z.number().int().positive(),
  currency: z.literal("INR").default("INR")
});

export const timelineEventSchema = z.object({
  actor: z.string().min(1).default("incident-commander"),
  eventType: z.string().min(1).default("note"),
  message: z.string().min(1)
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

