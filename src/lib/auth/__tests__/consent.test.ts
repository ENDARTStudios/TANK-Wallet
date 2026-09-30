import { describe, it, expect } from "bun:test";
import { recordConsent, consentSchema, type ConsentUpdateArgs } from "../consent";

function fakeUpdate() {
  const calls: ConsentUpdateArgs[] = [];
  return {
    calls,
    update: async (args: ConsentUpdateArgs) => {
      calls.push(args);
      return {};
    },
  };
}

describe("consent", () => {
  it("schema rejeita versões vazias", () => {
    expect(consentSchema.safeParse({ termsVersion: "", privacyVersion: "v1" }).success).toBe(false);
    expect(consentSchema.safeParse({ termsVersion: "2026-08-30" }).success).toBe(false);
  });

  it("schema aceita versões válidas", () => {
    expect(
      consentSchema.safeParse({ termsVersion: "2026-08-30", privacyVersion: "2026-08-30" }).success,
    ).toBe(true);
  });

  it("grava timestamps server-side e versões por usuário", async () => {
    const fake = fakeUpdate();
    const now = new Date("2026-09-30T12:00:00Z");
    await recordConsent(
      fake.update,
      "user-1",
      { termsVersion: "2026-08-30", privacyVersion: "2026-08-30" },
      now,
    );
    expect(fake.calls).toHaveLength(1);
    const args = fake.calls[0];
    expect(args.where).toEqual({ id: "user-1" });
    expect(args.data.termsAcceptedAt).toEqual(now);
    expect(args.data.termsVersion).toBe("2026-08-30");
    expect(args.data.privacyAcceptedAt).toEqual(now);
    expect(args.data.privacyVersion).toBe("2026-08-30");
  });
});
