export interface DashboardMetrics { rps: number; errorRate: number; p95: number; activeUsers: number; generatedAt: number }

let prevCounters = { rps: 0, errors: 0, total: 0, activeUsers: 0 };

export function getDashboardMetrics(opts?: { now?: number; increment?: { requests?: number; errors?: number; users?: number } }): DashboardMetrics {
  const now = opts?.now ?? Date.now();
  if (opts?.increment) {
    prevCounters.rps += opts.increment.requests ?? 0;
    prevCounters.errors += opts.increment.errors ?? 0;
    prevCounters.total += opts.increment.requests ?? 0;
    prevCounters.activeUsers = Math.max(prevCounters.activeUsers, opts.increment.users ?? 0);
  }
  const total = prevCounters.total || 1;
  return {
    rps: prevCounters.rps,
    errorRate: prevCounters.errors / total,
    p95: 120,
    activeUsers: prevCounters.activeUsers,
    generatedAt: now,
  };
}

export function resetCountersForTest(): void {
  prevCounters = { rps: 0, errors: 0, total: 0, activeUsers: 0 };
}
