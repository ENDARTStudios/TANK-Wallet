import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Caminho autenticado sob carga (T101, dívida D100): JWT real (cookie de sessão,
// forjado por gen-dev-tokens.ts com segredo DEV) — prova isolamento uid: do proxy.
// K6_TOKENS="jwt0,jwt1,..." (via env, nunca commitado).
// steady: 4 usuários ritmados → 200s. flood: user-0 sem pacing → 429s próprios,
// enquanto os demais seguem 200 (isolamento).

const TOKENS = (__ENV.K6_TOKENS || "").split(",").filter(Boolean);
if (TOKENS.length < 2) throw new Error("K6_TOKENS precisa de >= 2 tokens dev");

const limited = new Rate("limited_total");

export const options = {
  scenarios: {
    steady: { executor: "constant-vus", vus: 4, duration: "20s", exec: "steady" },
    flood: { executor: "constant-vus", vus: 1, duration: "20s", exec: "flood", startTime: "2s" },
  },
  thresholds: {
    checks: ["rate>0.95"],
    http_req_duration: ["p(95)<300"],
    limited_total: ["rate>0"],
  },
};

function authed(tokenIdx) {
  return { cookies: { "next-auth.session-token": TOKENS[tokenIdx % TOKENS.length] } };
}

export function steady() {
  const idx = 1 + (__ITER % (TOKENS.length - 1));
  const res = http.get("http://127.0.0.1:3000/api/risk", authed(idx));
  check(res, { "steady 200": (r) => r.status === 200 });
  sleep(0.5);
}

export function flood() {
  const res = http.get("http://127.0.0.1:3000/api/risk", authed(0));
  const ok = check(res, { "flood conforms": (r) => r.status === 200 || r.status === 429 });
  if (ok) limited.add(res.status === 429);
}
