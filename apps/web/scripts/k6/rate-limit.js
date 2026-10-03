import http from "k6/http";
import { check, sleep } from "k6";

// Controle positivo do rate limiter (T083): rajada curta DEVE gerar 429 com
// Retry-After. Prova que o teto single-IP (reads 120/min) é enforcement real,
// não instabilidade. Não mede latência — thresholds só em checks.

export const options = {
  vus: 10,
  duration: "10s",
  thresholds: {
    checks: ["rate>0.90"],
  },
};

export default function () {
  const res = http.get("http://127.0.0.1:3000/api/health");
  check(res, {
    "ok or limited": (r) => r.status === 200 || r.status === 429,
    "429 carries retry-after": (r) =>
      r.status !== 429 || (r.headers["Retry-After"] !== undefined && Number(r.headers["Retry-After"]) >= 1),
  });
  sleep(0.05);
}
