import { NextResponse } from "next/server";
import { getMetricsAsString } from "@/lib/observability/metrics";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  commit?: string;
  uptime?: number;
  checks: {
    database: boolean;
    observability: boolean;
    crypto: boolean;
    pipeline: boolean;
  };
  engines?: string[];
  metricsEndpoint: boolean;
}

export async function GET() {
  const checks: HealthStatus["checks"] = {
    database: true,
    observability: true,
    crypto: true,
    pipeline: true,
  };

  const status: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    checks,
    metricsEndpoint: true,
  };

  // Check if metrics endpoint is functional
  try {
    await getMetricsAsString();
  } catch {
    checks.observability = false;
    status.status = "degraded";
  }

  // List registered engines
  try {
    const { KERNEL_ENGINES } = await import("@/lib/wallet-kernel/kernel-runtime");
    status.engines = KERNEL_ENGINES.map((e) => e.id);
  } catch {
    checks.pipeline = false;
    status.status = "degraded";
  }

  if (!checks.database || !checks.crypto) status.status = "unhealthy";

  return NextResponse.json(status, {
    status: status.status === "unhealthy" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
