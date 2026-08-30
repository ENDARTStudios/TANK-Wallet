import { describe, it, expect } from "bun:test";
import { generateVapidKeys, getVapidPublicKey, sendPushVapid } from "../vapid";

describe("vapid", () => {
  it("gera chaves", () => {
    const keys = generateVapidKeys();
    expect(keys.publicKey.startsWith("vapid_pub_")).toBe(true);
    expect(keys.privateKey.startsWith("vapid_priv_")).toBe(true);
  });

  it("getVapidPublicKey", () => {
    expect(getVapidPublicKey()).toBeTruthy();
  });

  it("sendPushVapid", () => {
    expect(sendPushVapid({}, "hello").sent).toBe(true);
  });
});
