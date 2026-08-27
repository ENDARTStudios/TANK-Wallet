import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { analyzeBotSignal, getBotMode, shouldBlockBot } from "@/lib/security/bot-guard";

export default function proxy(request: NextRequest): NextResponse | Response {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    if (pathname !== "/api/health") {
      const botSignal = analyzeBotSignal({ headers: request.headers });
      const botMode = getBotMode();
      if (shouldBlockBot(botSignal, botMode)) {
        return new NextResponse(JSON.stringify({ error: "Forbidden (bot)", reasons: botSignal.reasons }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Bot-Score": String(botSignal.score),
            "X-Bot-Mode": botMode,
          },
        });
      }
    }

    const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    const limit = isWrite ? 30 : 120;
    const result = consumeRateLimit(
      {
        headers: request.headers,
        url: request.url,
        ip: (request as unknown as { ip?: string }).ip,
      },
      { limit },
    );

    const headers = getRateLimitHeaders(result);

    if (!result.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests", retryAfter: result.retryAfter }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
    }

    const res = NextResponse.next();
    for (const [k, v] of Object.entries(headers)) {
      res.headers.set(k, v);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
