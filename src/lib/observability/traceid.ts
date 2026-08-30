import { AsyncLocalStorage } from "async_hooks";

interface TraceContext { traceId: string; spanId?: string; parentSpanId?: string }

const storage = new AsyncLocalStorage<TraceContext>();

export function newTraceId(): string {
  let h = 0;
  for (let i = 0; i < 16; i++) h = ((h << 5) + h + Math.floor(Math.random() * 256)) >>> 0;
  const hex = h.toString(16).padStart(8, "0");
  return `trace_${hex}${Date.now().toString(16)}`;
}

export function withTraceId<T>(fn: () => T, parentTraceId?: string): T {
  const ctx: TraceContext = { traceId: parentTraceId ?? newTraceId() };
  return storage.run(ctx, fn);
}

export async function withTraceIdAsync<T>(fn: () => Promise<T>, parentTraceId?: string): Promise<T> {
  const ctx: TraceContext = { traceId: parentTraceId ?? newTraceId() };
  return storage.run(ctx, fn);
}

export function getCurrentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}

export function getCurrentContext(): TraceContext | undefined {
  return storage.getStore();
}
