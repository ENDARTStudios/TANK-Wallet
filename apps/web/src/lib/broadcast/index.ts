export interface BroadcastInput { chain: string; signedTx: `0x${string}` }
export interface BroadcastResult { success: boolean; hash?: `0x${string}`; error?: string; provider?: string }

const RPCS: Record<string, string[]> = {
  ethereum: ["https://eth.llamarpc.com", "https://1rpc.io/eth", "https://ethereum.publicnode.com"],
  polygon: ["https://polygon.llamarpc.com", "https://polygon.publicnode.com"],
  bsc: ["https://bsc.publicnode.com", "https://bsc-dataseed.binance.org"],
};

function getRpcs(chain: string): string[] {
  const alchemy = process.env.ALCHEMY_API_KEY ? [`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`] : [];
  const infura = process.env.INFURA_API_KEY ? [`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`] : [];
  return [...alchemy, ...infura, ...(RPCS[chain] ?? RPCS.ethereum)];
}

export async function broadcastTx(input: BroadcastInput, opts?: { fetchFn?: typeof fetch }): Promise<BroadcastResult> {
  const f = opts?.fetchFn ?? fetch;
  const rpcs = getRpcs(input.chain);
  let lastError = "No RPC";
  for (const rpc of rpcs) {
    try {
      const res = await f(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_sendRawTransaction", params: [input.signedTx] }),
      });
      const data = (await res.json()) as { result?: string; error?: { message: string } };
      if (data.result) return { success: true, hash: data.result as `0x${string}`, provider: rpc };
      lastError = data.error?.message ?? "RPC error";
    } catch (e) {
      lastError = (e as Error).message;
    }
  }
  return { success: false, error: lastError };
}
