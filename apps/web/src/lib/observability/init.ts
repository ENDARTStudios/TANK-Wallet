import { initSentry, isSentryReady, setTraceId } from "./sentry-real";
import { initTracing } from "./tracing";

export interface InitObservabilityOptions {
  dsn?: string;
  env?: string;
  release?: string;
  sampleRate?: number;
  otlpEndpoint?: string;
}

let initialized = false;

export async function initObservability(opts?: InitObservabilityOptions): Promise<{ ok: boolean; reason?: string }> {
  if (initialized) return { ok: true };
  initialized = true;
  const dsn = opts?.dsn ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
  const env = opts?.env ?? process.env.NODE_ENV ?? "development";
  const release = opts?.release ?? `tank-wallet@${process.env.npm_package_version ?? "1.2.0"}`;
  const sampleRate = opts?.sampleRate ?? 0.2;
  const otlpEndpoint = opts?.otlpEndpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (dsn) {
    const r = await initSentry({ dsn, env, release, traceId: undefined });
    if (!r.ok) return r;
  }
  try {
    initTracing();
  } catch {}
  void otlpEndpoint;
  void sampleRate;
  return { ok: true };
}

export function resetInitForTest(): void {
  initialized = false;
}

export function isObservabilityReady(): boolean {
  return isSentryReady();
}

export function setCurrentTraceId(id: string | undefined): void {
  setTraceId(id);
}
