import "dotenv/config";
import type { MockUpiMode, ReconcilerMode } from "@rpay/shared";

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  mockUpiMode: (process.env.MOCK_UPI_MODE ?? "normal") as MockUpiMode,
  reconcilerMode: (process.env.STATUS_RECONCILER_MODE ?? "healthy") as ReconcilerMode,
  corsOrigin: process.env.CORS_ORIGIN ?? /^http:\/\/localhost:\d+$/
};
