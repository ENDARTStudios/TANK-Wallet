export interface WCNamespace { eip155: { chains: string[]; methods: string[]; events: string[] } }
export interface WCSessionInfo { topic: string; namespaces: WCNamespace; expiry: number }
export interface WCProviderConfig { projectId: string; metadata: { name: string; url: string; icons: string[] }; namespaces: WCNamespace }

export function createWCProvider(config: WCProviderConfig): { projectId: string; namespaces: WCNamespace; metadata: WCProviderConfig["metadata"] } {
  if (!config.projectId) throw new Error("projectId required");
  return { projectId: config.projectId, namespaces: config.namespaces, metadata: config.metadata };
}

export function buildConnectionUri(provider: ReturnType<typeof createWCProvider>, topic: string): string {
  return `wc:${topic}@2?projectId=${provider.projectId}&relay-protocol=irn`;
}

export function defaultEip155Namespace(chains: string[] = ["eip155:1"]): WCNamespace {
  return { eip155: { chains, methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData_v4"], events: ["chainChanged", "accountsChanged"] } };
}
