import type { IntentKind, IntentSource } from "./classifier";

const counters = new Map<string, number>();

export function recordIntent(source: IntentSource, intent: IntentKind): void {
  const key = `${source}:${intent}`;
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

export function snapshotIntentCounters(): Record<string, number> {
  return Object.fromEntries(counters);
}

export function resetIntentCountersForTest(): void {
  counters.clear();
}
