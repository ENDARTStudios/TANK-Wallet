import { describe, it, expect } from "bun:test";
import { hashMessage } from "../eip712";

describe("eip712", () => {
  it("hashMessage retorna 0x", () => {
    const h = hashMessage("hello");
    expect(h.startsWith("0x")).toBe(true);
    expect(h.length).toBe(66);
  });

  it("hashMessage deterministico", () => {
    expect(hashMessage("a")).not.toBe(hashMessage("b"));
    expect(hashMessage("hello")).toBe(hashMessage("hello"));
  });
});
