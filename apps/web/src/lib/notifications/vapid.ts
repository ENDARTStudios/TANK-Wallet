export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  const pub = `vapid_pub_${Math.random().toString(36).slice(2, 10)}`;
  const priv = `vapid_priv_${Math.random().toString(36).slice(2, 10)}`;
  return { publicKey: pub, privateKey: priv };
}

export function getVapidPublicKey(): string {
  return process.env.VAPID_PUBLIC_KEY ?? "vapid_pub_mock";
}

export function sendPushVapid(subscription: unknown, payload: string): { sent: boolean } {
  void subscription;
  void payload;
  return { sent: true };
}
