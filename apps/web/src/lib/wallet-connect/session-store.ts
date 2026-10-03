export interface StoredSession { topic: string; namespaces: unknown; expiry: number; createdAt: number }

const store = new Map<string, StoredSession>();

export function saveSession(workspaceId: string, session: StoredSession): void {
  store.set(workspaceId, { ...session });
}

export function loadSession(workspaceId: string): StoredSession | undefined {
  return store.get(workspaceId);
}

export function clearSession(workspaceId: string): boolean {
  return store.delete(workspaceId);
}

export function listSessions(): string[] {
  return Array.from(store.keys());
}

export function clearAllSessionsForTest(): void {
  store.clear();
}
