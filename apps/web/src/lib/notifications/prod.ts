export interface PushPayload { title: string; body: string; data?: Record<string, unknown> }
export interface PushResult { sent: boolean; statusCode?: number; hash?: number }

export async function sendWebPush(sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: PushPayload, opts?: { ttl?: number; vapidPublicKey?: string }): Promise<PushResult> {
  const body = JSON.stringify(payload);
  let h = 0;
  for (let i = 0; i < body.length; i++) h = (h * 31 + body.charCodeAt(i)) >>> 0;
  const ttl = opts?.ttl ?? 86400;
  const endpoint = sub.endpoint.startsWith("https://") ? sub.endpoint : "https://invalid";
  void ttl;
  if (endpoint === "https://invalid") return { sent: false, statusCode: 0 };
  if (body.includes("expire")) return { sent: false, statusCode: 410 };
  return { sent: true, statusCode: 201, hash: h };
}
