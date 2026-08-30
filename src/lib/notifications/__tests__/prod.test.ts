import { describe, it, expect } from "bun:test";
import { sendWebPush } from "../prod";

describe("prod (push)", () => {
  it("sendWebPush sucesso com endpoint válido", async () => {
    const r = await sendWebPush({ endpoint: "https://push.example.com/abc", keys: { p256dh: "p", auth: "a" } }, { title: "Hi", body: "World" });
    expect(r.sent).toBe(true);
    expect(r.statusCode).toBe(201);
  });

  it("sendWebPush falha sem https", async () => {
    const r = await sendWebPush({ endpoint: "http://invalid", keys: { p256dh: "p", auth: "a" } }, { title: "x", body: "y" });
    expect(r.sent).toBe(false);
  });

  it("sendWebPush remove subscription em 410", async () => {
    const r = await sendWebPush({ endpoint: "https://push.example.com", keys: { p256dh: "p", auth: "a" } }, { title: "expire", body: "now" });
    expect(r.sent).toBe(false);
    expect(r.statusCode).toBe(410);
  });
});
