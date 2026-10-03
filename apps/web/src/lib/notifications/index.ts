export interface PushSubscription { endpoint: string; keys: { p256dh: string; auth: string } }

const subs = new Map<string, PushSubscription>();

export function subscribePush(workspaceId: string, sub: PushSubscription): void {
  subs.set(workspaceId, sub);
}

export function getSubscription(workspaceId: string): PushSubscription | undefined {
  return subs.get(workspaceId);
}

export function sendPush(workspaceId: string, payload: { title: string; body: string }): { sent: boolean; subscription?: PushSubscription } {
  const sub = subs.get(workspaceId);
  if (!sub) return { sent: false };
  return { sent: true, subscription: sub };
}

export function clearNotificationsForTest(): void {
  subs.clear();
}
