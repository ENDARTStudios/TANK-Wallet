import { describe, it, expect, beforeEach } from "bun:test";
import { subscribePush, getSubscription, sendPush, clearNotificationsForTest } from "../index";

describe("notifications", () => {
  beforeEach(() => clearNotificationsForTest());

  it("subscribe e get", () => {
    const sub = { endpoint: "https://push.example/1", keys: { p256dh: "p256", auth: "auth" } };
    subscribePush("ws1", sub);
    expect(getSubscription("ws1")).toEqual(sub);
  });

  it("sendPush quando inscrito", () => {
    subscribePush("ws1", { endpoint: "https://push.example/1", keys: { p256dh: "p", auth: "a" } });
    const res = sendPush("ws1", { title: "Alerta", body: "Risco detectado" });
    expect(res.sent).toBe(true);
  });

  it("sendPush falha sem inscrição", () => {
    expect(sendPush("ws2", { title: "x", body: "y" }).sent).toBe(false);
  });
});
