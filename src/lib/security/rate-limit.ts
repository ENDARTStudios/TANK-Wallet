type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getWindowMs(): number {
  return 60_000;
}

function getLimit(fallback: number): number {
  const raw = process.env.API_RATE_LIMIT_PER_MIN;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function rateLimitKey(req: Request | { headers: Headers; url: string; ip?: string }, userId?: string): string {
  const anyReq = req as unknown as { ip?: string; headers: Headers; url?: string };
  const forwarded = anyReq.headers.get("x-forwarded-for") ?? "";
  const ip = anyReq.ip ?? forwarded.split(",")[0]?.trim() ?? anyReq.headers.get("x-real-ip") ?? "unknown";
  const url = (anyReq as { url?: string }).url ?? "";
  let path = "unknown";
  try {
    path = url ? new URL(url).pathname : "unknown";
  } catch {
    path = url || "unknown";
  }
  if (userId) return `uid:${userId}:${path}`;
  const key = `${ip}:${path}`;
  return key;
}

export function checkRateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number; now?: number },
): { allowed: boolean; remaining: number; retryAfter: number; limit: number; resetAt: number } {
  const limit = opts?.limit ?? getLimit(120);
  const windowMs = opts?.windowMs ?? getWindowMs();
  const now = opts?.now ?? Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, retryAfter: 0, limit, resetAt };
  }
  if (bucket.count < limit) {
    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count, retryAfter: 0, limit, resetAt: bucket.resetAt };
  }
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
  return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter), limit, resetAt: bucket.resetAt };
}

export function consumeRateLimit(
  req: Request | { headers: Headers; url: string; ip?: string },
  opts?: { limit?: number; windowMs?: number; userId?: string },
): { allowed: boolean; remaining: number; retryAfter: number; limit: number; resetAt: number } {
  const key = rateLimitKey(req, opts?.userId);
  return checkRateLimit(key, opts);
}

export function resetRateLimitForTest(): void {
  buckets.clear();
  counters.clear();
}

export type RateLimitOperation = "send" | "swap" | "approve" | "bridge" | "monitor";

export const OPERATION_LIMITS: Record<RateLimitOperation, number> = {
  send: 10,
  swap: 5,
  approve: 3,
  bridge: 2,
  monitor: 600,
};

export const GLOBAL_IP_LIMIT = 100;

const counters = new Map<string, number>();

function recordRateLimit(operation: string, allowed: boolean): void {
  const key = `${operation}:${allowed ? "allowed" : "blocked"}`;
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

export function snapshotRateLimitCounters(): Record<string, number> {
  return Object.fromEntries(counters);
}

export interface AdvancedRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
  resetAt: number;
  operation?: RateLimitOperation;
  headers: Record<string, string>;
}

export function consumeRateLimitAdvanced(
  req: Request | { headers: Headers; url: string; ip?: string },
  opts?: { userId?: string; operation?: RateLimitOperation; windowMs?: number; now?: number },
): AdvancedRateLimitResult {
  const windowMs = opts?.windowMs ?? getWindowMs();
  const now = opts?.now ?? Date.now();
  const anyReq = req as unknown as { ip?: string; headers: Headers; url?: string };
  const forwarded = anyReq.headers.get("x-forwarded-for") ?? "";
  const ip = anyReq.ip ?? forwarded.split(",")[0]?.trim() ?? anyReq.headers.get("x-real-ip") ?? "unknown";
  const operation = opts?.operation;
  const opLimit = operation !== undefined ? OPERATION_LIMITS[operation] : GLOBAL_IP_LIMIT;
  const subject = opts?.userId ?? ip;
  const opKey = `${subject}:op:${operation ?? "global"}`;
  const opRes = checkRateLimit(opKey, { limit: opLimit, windowMs, now });
  const ipRes = checkRateLimit(`${ip}:global`, { limit: GLOBAL_IP_LIMIT, windowMs, now });
  const blocked = !opRes.allowed || !ipRes.allowed;
  const primary = operation !== undefined ? opRes : ipRes;
  const retryFrom = !opRes.allowed ? opRes : ipRes;
  recordRateLimit(operation ?? "global", !blocked);
  const headers: Record<string, string> = { ...getRateLimitHeaders(primary) };
  if (operation !== undefined) headers["X-RateLimit-Operation"] = operation;
  return {
    allowed: !blocked,
    remaining: primary.remaining,
    retryAfter: retryFrom.retryAfter,
    limit: primary.limit,
    resetAt: primary.resetAt,
    operation,
    headers: {
      ...headers,
      ...(retryFrom.retryAfter ? { "Retry-After": String(retryFrom.retryAfter) } : {}),
    },
  };
}

export function getRateLimitHeaders(result: { remaining: number; limit: number; resetAt: number; retryAfter: number }) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
  } as const;
}
