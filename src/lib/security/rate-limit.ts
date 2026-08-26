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

export function rateLimitKey(req: Request | { headers: Headers; url: string; ip?: string }): string {
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
  opts?: { limit?: number; windowMs?: number },
): { allowed: boolean; remaining: number; retryAfter: number; limit: number; resetAt: number } {
  const key = rateLimitKey(req);
  return checkRateLimit(key, opts);
}

export function resetRateLimitForTest(): void {
  buckets.clear();
}

export function getRateLimitHeaders(result: { remaining: number; limit: number; resetAt: number; retryAfter: number }) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
  } as const;
}
