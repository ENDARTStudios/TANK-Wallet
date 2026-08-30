import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/billing/stripe";
import { redactSecrets } from "@/lib/observability/redact";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!verifyWebhookSignature(body, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const event = JSON.parse(redactSecrets(body)) as { type?: string };
  return NextResponse.json({ received: true, type: event.type ?? "unknown" });
}
