import { getDashboardMetrics } from "@/lib/metrics/dashboard";

export async function GET() {
  const m = getDashboardMetrics();
  const lines = [
    "# HELP tank_wallet_rps Requests per second",
    "# TYPE tank_wallet_rps gauge",
    `tank_wallet_rps ${m.rps}`,
    "# HELP tank_wallet_error_rate Error rate",
    "# TYPE tank_wallet_error_rate gauge",
    `tank_wallet_error_rate ${m.errorRate.toFixed(6)}`,
    "# HELP tank_wallet_p95_latency_ms P95 latency ms",
    "# TYPE tank_wallet_p95_latency_ms gauge",
    `tank_wallet_p95_latency_ms ${m.p95}`,
    "# HELP tank_wallet_active_users Active users",
    "# TYPE tank_wallet_active_users gauge",
    `tank_wallet_active_users ${m.activeUsers}`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; version=0.0.4" } });
}
