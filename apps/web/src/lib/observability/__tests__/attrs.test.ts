import { describe, it, expect } from "bun:test";
import { getOtelAttrs, getOtelResource } from "../attrs";

describe("otel attrs", () => {
  it("getOtelAttrs retorna service/version/env/host/pid", () => {
    const a = getOtelAttrs();
    expect(a["service.name"]).toBe("tank-wallet");
    expect(a["service.version"]).toBeTruthy();
    expect(a["deployment.environment"]).toBeTruthy();
    expect(typeof a["process.pid"]).toBe("number");
  });

  it("getOtelResource envelopa attributes", () => {
    const r = getOtelResource();
    expect(r.attributes).toBeDefined();
    expect(r.attributes["service.name"]).toBe("tank-wallet");
  });
});
