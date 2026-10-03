export function withWorkspaceFilter<T extends Record<string, unknown>>(
  workspaceId: string | undefined | null,
  where: T | undefined,
): T & { workspaceId?: string } {
  if (!workspaceId) return { ...(where ?? ({} as T)), workspaceId: undefined } as T & { workspaceId?: string };
  return { ...(where ?? ({} as T)), workspaceId } as T & { workspaceId?: string };
}

export function assertSameWorkspace(
  recordWorkspaceId: string | null | undefined,
  ctxWorkspaceId: string | null | undefined,
): { ok: true } | { ok: false; status: 403; message: string } {
  if (!ctxWorkspaceId) return { ok: false, status: 403, message: "Missing workspace context" };
  if (!recordWorkspaceId) return { ok: true };
  if (recordWorkspaceId !== ctxWorkspaceId) return { ok: false, status: 403, message: "Cross-workspace access denied" };
  return { ok: true };
}

export function filterByWorkspace<T extends { workspaceId?: string | null }>(items: T[], workspaceId: string): T[] {
  return items.filter((it) => !it.workspaceId || it.workspaceId === workspaceId);
}
