export type Role = "viewer" | "member" | "admin" | "security" | "owner";
export type Permission =
  | "view_portfolio"
  | "sign_transaction"
  | "revoke_approval"
  | "lockdown_self"
  | "lockdown_global"
  | "change_blocklist"
  | "manage_members"
  | "manage_billing"
  | "export_audit"
  | "delete_workspace"
  | "get_health"
  | "get_metrics"
  | "get_threats"
  | "post_threats_seed"
  | "get_whois"
  | "post_lockdown";

export const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  viewer: new Set<Permission>(["view_portfolio", "get_health", "get_threats", "get_whois"]),
  member: new Set<Permission>([
    "view_portfolio",
    "sign_transaction",
    "revoke_approval",
    "lockdown_self",
    "get_health",
    "get_threats",
    "get_whois",
    "post_lockdown",
  ]),
  admin: new Set<Permission>([
    "view_portfolio",
    "revoke_approval",
    "lockdown_self",
    "lockdown_global",
    "change_blocklist",
    "manage_members",
    "manage_billing",
    "export_audit",
    "get_health",
    "get_metrics",
    "get_threats",
    "post_threats_seed",
    "get_whois",
    "post_lockdown",
  ]),
  security: new Set<Permission>([
    "view_portfolio",
    "revoke_approval",
    "lockdown_self",
    "lockdown_global",
    "change_blocklist",
    "export_audit",
    "get_health",
    "get_metrics",
    "get_threats",
    "post_threats_seed",
    "get_whois",
    "post_lockdown",
  ]),
  owner: new Set<Permission>([
    "view_portfolio",
    "sign_transaction",
    "revoke_approval",
    "lockdown_self",
    "lockdown_global",
    "change_blocklist",
    "manage_members",
    "manage_billing",
    "export_audit",
    "delete_workspace",
    "get_health",
    "get_metrics",
    "get_threats",
    "post_threats_seed",
    "get_whois",
    "post_lockdown",
  ]),
};

export function hasPermission(role: Role | string, perm: Permission): boolean {
  const set = ROLE_PERMISSIONS[role as Role];
  if (!set) return false;
  return set.has(perm);
}

export interface AuthContext {
  userId?: string;
  workspaceId?: string;
  role?: Role | string;
  tier?: string;
}

export function requirePermission(ctx: AuthContext | null | undefined, perm: Permission): { ok: true } | { ok: false; status: 401 | 403; message: string } {
  if (!ctx || !ctx.role) return { ok: false, status: 401, message: "Unauthorized" };
  if (!hasPermission(ctx.role, perm)) return { ok: false, status: 403, message: "Forbidden" };
  return { ok: true };
}

export function getSessionContext(headers: Headers): AuthContext | null {
  const workspaceId = headers.get("x-workspace-id") ?? undefined;
  const role = (headers.get("x-user-role") ?? undefined) as Role | undefined;
  const userId = headers.get("x-user-id") ?? undefined;
  if (!role) return null;
  return { workspaceId, role, userId };
}
