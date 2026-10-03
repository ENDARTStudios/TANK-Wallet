export interface SyncStatus { lastSyncAt: number; workspaceId: string; pending: number }

const syncs = new Map<string, number>();

export function syncPortfolio(workspaceId: string, data: unknown): { success: boolean; at: number } {
  const at = Date.now();
  syncs.set(workspaceId, at);
  void data;
  return { success: true, at };
}

export function getSyncStatus(workspaceId: string): SyncStatus {
  return { lastSyncAt: syncs.get(workspaceId) ?? 0, workspaceId, pending: 0 };
}

export function clearSyncForTest(): void {
  syncs.clear();
}
