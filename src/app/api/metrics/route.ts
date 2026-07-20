import { NextResponse } from "next/server";
import { getMetricsAsString } from "@/lib/observability/metrics";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const m = await getMetricsAsString(); return new NextResponse(m, { status: 200, headers: { "Content-Type": "text/plain; version=0.0.4" } }); }
  catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
