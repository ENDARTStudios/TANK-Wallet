/**
 * OpenTelemetry tracing setup.
 * @stable
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
let sdk: NodeSDK | null = null;
export function initTracing(): void {
  if (sdk) return;
  const isDev = process.env.NODE_ENV !== "production";
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (isDev) diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  const exporter = new OTLPTraceExporter(endpoint ? { url: endpoint } : undefined);
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "tank-wallet", [ATTR_SERVICE_VERSION]: "1.0.0",
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: isDev ? "development" : "production",
    }),
    traceExporter: exporter, instrumentations: [],
  });
  sdk.start();
}
export async function shutdownTracing(): Promise<void> { if (sdk) { await sdk.shutdown(); sdk = null; } }
const tracingModule = { initTracing, shutdownTracing };
export default tracingModule;
