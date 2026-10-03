export interface SentryContext { dsn: string; env: string; release: string; traceId?: string }
export interface CaptureResult { eventId: string; timestamp: number }

let initialized = false;
let lastTraceId: string | undefined;

export async function initSentry(ctx: SentryContext): Promise<{ ok: boolean; reason?: string }> {
  if (!ctx.dsn) return { ok: false, reason: "No DSN" };
  try {
    const Sentry = (await import("@sentry/nextjs")) as unknown as { init: (opts: Record<string, unknown>) => void };
    Sentry.init({ dsn: ctx.dsn, environment: ctx.env, release: ctx.release, tracesSampleRate: 0.2 });
    initialized = true;
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

export function isSentryReady(): boolean {
  return initialized;
}

export async function captureException(err: Error, context?: Record<string, unknown>): Promise<CaptureResult> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const traceId = context?.traceId ?? lastTraceId;
  if (initialized) {
    try {
      const Sentry = (await import("@sentry/nextjs")) as unknown as { captureException: (e: Error, opts: Record<string, unknown>) => string };
      Sentry.captureException(err, { extra: { ...context, traceId } });
    } catch {}
  }
  return { eventId, timestamp: Date.now() };
}

export function setTraceId(id: string | undefined): void {
  lastTraceId = id;
}

export function getTraceId(): string | undefined {
  return lastTraceId;
}
