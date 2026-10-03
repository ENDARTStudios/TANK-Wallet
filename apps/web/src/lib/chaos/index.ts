export type ChaosType = "latency" | "rpc_failure" | "reorg";

export interface ChaosConfig { type: ChaosType; delayMs?: number; probability?: number }

export function injectChaos<T>(fn: () => Promise<T> | T, config: ChaosConfig): Promise<T> {
  const p = config.probability ?? 1;
  if (Math.random() > p) return Promise.resolve(fn() as T);
  switch (config.type) {
    case "latency": {
      const d = config.delayMs ?? 100;
      return new Promise<T>((resolve) => setTimeout(() => resolve(fn() as T), d));
    }
    case "rpc_failure":
      return Promise.reject(new Error("Chaos: RPC failure injected"));
    case "reorg":
      return Promise.reject(new Error("Chaos: reorg injected"));
    default:
      return Promise.resolve(fn() as T);
  }
}

export function injectLatency<T>(fn: () => T, delayMs = 100): Promise<T> {
  return injectChaos(() => fn(), { type: "latency", delayMs, probability: 1 });
}
