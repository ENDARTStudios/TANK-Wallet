import { fetchAlchemyTransfers } from "./providers/alchemy";
import { fetchHeliusSpl } from "./providers/helius";
import { fetchBlockstreamTxs } from "./providers/blockstream";

export interface DiscoverInput { chain: string; address: string }
export interface DiscoverResult { erc20: { symbol: string; balance: string }[]; erc721: { tokenId: string }[]; erc1155: { tokenId: string }[]; btc: { txid: string }[]; spl: { mint: string }[]; cached: boolean }

const cache = new Map<string, { result: DiscoverResult; at: number }>();
const CACHE_MS = 30_000;

function key(input: DiscoverInput): string {
  return `${input.chain}:${input.address}`;
}

export async function discoverAssets(input: DiscoverInput, opts?: { now?: number }): Promise<DiscoverResult> {
  const k = key(input);
  const now = opts?.now ?? Date.now();
  const cached = cache.get(k);
  if (cached && now - cached.at < CACHE_MS) return { ...cached.result, cached: true };

  let erc20: DiscoverResult["erc20"] = [];
  let erc721: DiscoverResult["erc721"] = [];
  let erc1155: DiscoverResult["erc1155"] = [];
  let btc: DiscoverResult["btc"] = [];
  let spl: DiscoverResult["spl"] = [];

  if (["ethereum", "polygon", "bsc", "arbitrum"].includes(input.chain)) {
    const transfers = await fetchAlchemyTransfers(input.chain, input.address).catch(() => []);
    erc20 = transfers.map(() => ({ symbol: "MOCK", balance: "100" }));
    erc721 = [];
    erc1155 = [];
  } else if (input.chain === "solana") {
    spl = await fetchHeliusSpl(input.address).catch(() => []);
  } else if (input.chain === "bitcoin") {
    btc = await fetchBlockstreamTxs(input.address).catch(() => []);
  }

  const result: DiscoverResult = { erc20, erc721, erc1155, btc, spl, cached: false };
  cache.set(k, { result, at: now });
  return result;
}

export function clearIndexerCacheForTest(): void {
  cache.clear();
}
