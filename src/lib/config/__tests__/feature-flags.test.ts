import { describe, it, expect, afterEach } from "bun:test";
import { isFeatureOn, DEFAULT_FEATURE_FLAGS } from "../feature-flags";

describe("feature-flags", () => {
  const prevEnv: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of Object.keys(prevEnv)) {
      if (prevEnv[k] === undefined) delete process.env[k];
      else process.env[k] = prevEnv[k];
    }
  });

  it("default flags respeitam DEFAULT_FEATURE_FLAGS", () => {
    delete process.env.FEATURE_BOT_MODE;
    delete process.env.FEATURE_ADMIN_RBAC;
    expect(isFeatureOn("bot_mode")).toBe(DEFAULT_FEATURE_FLAGS.bot_mode);
    expect(isFeatureOn("admin_rbac")).toBe(DEFAULT_FEATURE_FLAGS.admin_rbac);
  });

  it("env true sobrepõe default", () => {
    process.env.FEATURE_ADMIN_RBAC = "1";
    expect(isFeatureOn("admin_rbac")).toBe(true);
    process.env.FEATURE_ADMIN_RBAC = "false";
    expect(isFeatureOn("admin_rbac")).toBe(false);
  });

  it("override de banco sobrepõe default quando env ausente", () => {
    delete process.env.FEATURE_OWL_BEHAVIOR;
    expect(isFeatureOn("owl_behavior", { overrides: { owl_behavior: true } })).toBe(true);
    expect(isFeatureOn("owl_behavior", { overrides: { owl_behavior: false } })).toBe(false);
  });

  it("env tem precedência sobre override", () => {
    process.env.FEATURE_OWL_BEHAVIOR = "0";
    expect(isFeatureOn("owl_behavior", { overrides: { owl_behavior: true } })).toBe(false);
  });

  it("tier não quebra (compat)", () => {
    delete process.env.FEATURE_BOT_MODE;
    expect(isFeatureOn("bot_mode", { tier: "pro" })).toBe(DEFAULT_FEATURE_FLAGS.bot_mode);
  });
});
