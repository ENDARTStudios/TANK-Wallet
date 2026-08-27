export interface WCSession {
  topic: string;
  peer: { name: string; url: string; icons: string[] };
  expiry: number;
}

export interface WCClient {
  projectId: string;
  sessions: Map<string, WCSession>;
  pair(uri: string): Promise<{ topic: string }>;
  disconnect(topic: string): Promise<void>;
  onSessionProposal(cb: (session: WCSession) => void): void;
}

let client: WCClient | null = null;
const proposalCbs: Array<(s: WCSession) => void> = [];

export function createWalletConnectClient(projectId?: string): WCClient {
  const pid = projectId ?? process.env.WALLETCONNECT_PROJECT_ID ?? "dev-project-id";
  client = {
    projectId: pid,
    sessions: new Map<string, WCSession>(),
    async pair(uri: string) {
      const topic = uri.split(":")[1]?.split("@")[0] ?? `topic_${Date.now()}`;
      const session: WCSession = {
        topic,
        peer: { name: "DApp", url: uri, icons: [] },
        expiry: Date.now() + 60_000,
      };
      client!.sessions.set(topic, session);
      for (const cb of proposalCbs) cb(session);
      return { topic };
    },
    async disconnect(topic: string) {
      client!.sessions.delete(topic);
    },
    onSessionProposal(cb) {
      proposalCbs.push(cb);
    },
  };
  return client;
}

export function getWCClient(): WCClient | null {
  return client;
}

export function resetWCForTest(): void {
  client = null;
  proposalCbs.length = 0;
}
