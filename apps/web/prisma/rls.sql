-- RLS policies for Postgres (prod). SQLite dev não usa; aplicar com psql -f prisma/rls.sql
-- Requer: SET app.current_workspace = '<workspaceId>' por conexão (via middleware Prisma $executeRaw)

-- Helper: current_workspace()
CREATE OR REPLACE FUNCTION current_workspace() RETURNS TEXT AS $$
  SELECT current_setting('app.current_workspace', true);
$$ LANGUAGE sql STABLE;

-- PermissionAuditLog
ALTER TABLE "PermissionAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PermissionAuditLog" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_isolation ON "PermissionAuditLog";
CREATE POLICY audit_isolation ON "PermissionAuditLog"
  FOR ALL USING ("workspaceId" = current_workspace());

-- BehaviorProfile
ALTER TABLE "BehaviorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BehaviorProfile" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS behavior_profile_isolation ON "BehaviorProfile";
CREATE POLICY behavior_profile_isolation ON "BehaviorProfile"
  FOR ALL USING ("workspaceId" = current_workspace() OR "workspaceId" IS NULL);

-- BehaviorAnomaly
ALTER TABLE "BehaviorAnomaly" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BehaviorAnomaly" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS behavior_anomaly_isolation ON "BehaviorAnomaly";
CREATE POLICY behavior_anomaly_isolation ON "BehaviorAnomaly"
  FOR ALL USING ("workspaceId" = current_workspace() OR "workspaceId" IS NULL);

-- RecoveryContact
ALTER TABLE "RecoveryContact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecoveryContact" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recovery_isolation ON "RecoveryContact";
CREATE POLICY recovery_isolation ON "RecoveryContact"
  FOR ALL USING ("workspaceId" = current_workspace() OR "workspaceId" IS NULL);

-- User (ver apenas do próprio workspace)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_isolation ON "User";
CREATE POLICY user_isolation ON "User"
  FOR ALL USING ("workspaceId" = current_workspace());

-- Workspace (ver apenas o próprio)
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workspace_isolation ON "Workspace";
CREATE POLICY workspace_isolation ON "Workspace"
  FOR ALL USING ("id" = current_workspace());
