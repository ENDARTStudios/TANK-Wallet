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

const HEADERS = {
  "Content-Type": "application/json",
  "x-user-id": "k6-smoke",
  "x-user-role": "member",
  "x-workspace-id": "k6-ws",
};

export default function () {
  const res = http.get("http://127.0.0.1:3000/api/risk", { headers: HEADERS });
  check(res, {
    "risk 200": (r) => r.status === 200,
    "risk service": (r) => r.json("service") === "risk",
  });
  sleep(0.2);
}
