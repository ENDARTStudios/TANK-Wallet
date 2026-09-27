import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { consumeRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { analyzeBotSignal, getBotMode, shouldBlockBot } from "@/lib/security/bot-guard";
import { generateNonce, buildReportOnlyPolicy, buildEnforcingPolicy, isCspEnforceOn, reportingEndpointsHeader } from "@/lib/security/csp";

export default async function proxy(request: NextRequest): Promise<NextResponse | Response> {
  const pathname = request.nextUrl.pathname;
  const cspNonce = generateNonce();
  const enforcing = isCspEnforceOn();
  const cspPolicy = enforcing ? buildEnforcingPolicy(cspNonce) : buildReportOnlyPolicy(cspNonce);
  const cspHeaderName = enforcing ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/health") {
      // Monitoria em bucket próprio na rota (600/min, T098): não consome budget de negócio.
      const healthRes = NextResponse.next();
      healthRes.headers.set(cspHeaderName, cspPolicy);
      healthRes.headers.set("Reporting-Endpoints", reportingEndpointsHeader());
      healthRes.headers.set("x-csp-nonce", cspNonce);
      return healthRes;
    }
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
    // 30 req/min for writes (POST/PUT/PATCH/DELETE), 120 req/min for reads (GET/HEAD/OPTIONS)
    // Key = userId de sessão JWT validada (T098, anti-CGNAT); fallback IP p/ anônimos.
    // Nunca header client-supplied (spoofing: rotação de identidade p/ evadir limite).
    const limit = isWrite ? 30 : 120;
    let userId: string | undefined;
    // Otimização: sem cookie de sessão não há identidade — evita decrypt JWE por request.
    const cookies = request.cookies;
    const hasSessionCookie =
      cookies.has("next-auth.session-token") || cookies.has("__Secure-next-auth.session-token");
    if (hasSessionCookie) {
      try {
        const token = await getToken({ req: request });
        if (token && typeof token.sub === "string" && token.sub) userId = token.sub;
      } catch {
        userId = undefined;
      }
    }
    const result = consumeRateLimit(
      {
        headers: request.headers,
        url: request.url,
        ip: (request as unknown as { ip?: string }).ip,
      },
      { limit, userId },
    );

    const headers = getRateLimitHeaders(result);

    if (!result.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests", retryAfter: result.retryAfter }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          [cspHeaderName]: cspPolicy,
          "Reporting-Endpoints": reportingEndpointsHeader(),
        },
      });
    }

    const res = NextResponse.next();
    for (const [k, v] of Object.entries(headers)) {
      res.headers.set(k, v);
    }
    res.headers.set(cspHeaderName, cspPolicy);
    res.headers.set("Reporting-Endpoints", reportingEndpointsHeader());
    res.headers.set("x-csp-nonce", cspNonce);
    return res;
  }

  // Pages and assets are not rate-limited
  const pageres = NextResponse.next();
  pageres.headers.set(cspHeaderName, cspPolicy);
  pageres.headers.set("Reporting-Endpoints", reportingEndpointsHeader());
  pageres.headers.set("x-csp-nonce", cspNonce);
  return pageres;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
