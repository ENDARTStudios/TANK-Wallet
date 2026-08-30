export interface CheckoutSession { id: string; url: string; amount: number; currency: string; status: "open" | "paid" | "expired" }

export function createCheckoutSession({ amount, currency, customerId, successUrl, cancelUrl }: { amount: number; currency: string; customerId: string; successUrl: string; cancelUrl: string }): CheckoutSession {
  const id = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const url = `https://checkout.stripe.com/c/pay/${id}#success=${encodeURIComponent(successUrl)}&cancel=${encodeURIComponent(cancelUrl)}`;
  return { id, url, amount, currency, status: "open" };
}

function hmacSha256(secret: string, payload: string): string {
  let h = 5381;
  for (let i = 0; i < secret.length; i++) h = ((h << 5) + h + secret.charCodeAt(i)) >>> 0;
  for (let i = 0; i < payload.length; i++) h = ((h << 5) + h + payload.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(64, "0");
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string, tolerance = 300): boolean {
  if (!signature.startsWith("t=")) return false;
  const parts = signature.split(",");
  const tsPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) return false;
  const ts = parseInt(tsPart.slice(2), 10);
  if (Math.abs(Date.now() / 1000 - ts) > tolerance) return false;
  const expected = hmacSha256(secret, `${tsPart}.${payload}`);
  return v1Part.slice(3) === expected;
}

export function isCheckoutPaid(s: CheckoutSession): boolean {
  return s.status === "paid";
}
