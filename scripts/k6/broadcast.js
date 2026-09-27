import http from "k6/http";
import { check, sleep } from "k6";

// Broadcast: APENAS corpo inválido (400 esperado). Nunca enviar signedTx válido
// em load test — alcançaria broadcastTx (RPCs externos, gasto real, risco de
// broadcast). Mede pilha auth+zod+headers, não o broadcast.

export const options = {
  vus: 1,
  duration: "10s",
  noConnectionReuse: true,
  thresholds: {
    checks: ["rate>0.99"],
    http_req_duration: ["p(95)<100"],
  },
};

const HEADERS = {
  "Content-Type": "application/json",
  "x-user-id": "k6-smoke",
  "x-user-role": "member",
  "x-workspace-id": "k6-ws",
};

export default function () {
  const res = http.post(
    "http://127.0.0.1:3000/api/broadcast",
    JSON.stringify({ chain: "ethereum" }),
    { headers: HEADERS },
  );
  check(res, {
    "broadcast 400 (invalid body, never broadcast)": (r) => r.status === 400,
  });
  sleep(0.1);
}
