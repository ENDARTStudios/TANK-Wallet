import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<100"],
  },
};

export default function () {
  const res = http.get("http://127.0.0.1:3000/api/health");
  check(res, {
    "health 200": (r) => r.status === 200,
    "health body ok": (r) => ["healthy", "degraded"].includes(r.json("status")),
  });
  sleep(0.2);
}
