/** Sentry init. @stable */
import { initTracing } from "./tracing";
export function initObservability(): void {
  initTracing();
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return;
  import("@sentry/nextjs").then(S => S.init({ dsn, environment: process.env.NODE_ENV, release: "tank-wallet@1.0.0", tracesSampleRate: 0.1 })).catch(() => {});
}
export default { initObservability };
