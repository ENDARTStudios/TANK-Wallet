/**
 * Prometheus metrics for Tank Wallet.
 * @stable
 */
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";
const register = new Registry();
collectDefaultMetrics({ register });
export const decisionsTotal = new Counter({ name: "tank_decisions_total", help: "Total decisions", labelNames: ["result","engine","chain"], registers: [register] });
export const threatsBlockedTotal = new Counter({ name: "tank_threats_blocked_total", help: "Threats blocked", labelNames: ["severity","type","chain"], registers: [register] });
export const rpcCallsTotal = new Counter({ name: "tank_rpc_calls_total", help: "RPC calls", labelNames: ["provider","chain","method","status"], registers: [register] });
export const decisionDurationMs = new Histogram({ name: "tank_decision_duration_ms", help: "Decision latency", labelNames: ["engine","chain"], buckets: [1,5,10,25,50,100,200,500,1000], registers: [register] });
export const engineStatus = new Gauge({ name: "tank_engine_status", help: "Engine health", labelNames: ["engine"], registers: [register] });
export const securityScore = new Gauge({ name: "tank_security_score", help: "Security score", labelNames: ["component"], registers: [register] });
export async function getMetricsAsString(): Promise<string> { return register.metrics(); }
const metricsModule = { decisionsTotal, threatsBlockedTotal, rpcCallsTotal, decisionDurationMs, engineStatus, securityScore, getMetricsAsString };
export default metricsModule;
