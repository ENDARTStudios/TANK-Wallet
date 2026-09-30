import { describe, it, expect } from "bun:test";
import { assertAuthSecret } from "../nextauth";

const STRONG = "a".repeat(32);

describe("assertAuthSecret (§25 fail-closed)", () => {
  it("produção sem NEXTAUTH_SECRET lança", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toThrow(
      /NEXTAUTH_SECRET/,
    );
  });

  it("produção com placeholder de dev lança", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", NEXTAUTH_SECRET: "dev-secret-change-me" } as NodeJS.ProcessEnv),
    ).toThrow(/NEXTAUTH_SECRET/);
  });

  it("produção com string vazia/somente espaços lança", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", NEXTAUTH_SECRET: "   " } as NodeJS.ProcessEnv),
    ).toThrow(/NEXTAUTH_SECRET/);
  });

  it("produção com segredo forte não lança", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", NEXTAUTH_SECRET: STRONG } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });

  it("Vercel preview sem segredo NÃO lança (builds/previews precisam passar)", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", VERCEL_ENV: "preview" } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });

  it("desenvolvimento sem segredo não lança", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).not.toThrow();
  });
});
