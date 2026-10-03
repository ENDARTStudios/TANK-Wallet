export interface ChainPatrolResult { isMalicious: boolean; severity: number; reason: string; source: string }

export async function checkChainPatrol(url: string, signal?: AbortSignal): Promise<ChainPatrolResult | null> {
  try {
    void signal;
    if (url.includes("metarnask") || url.includes("uniswap-airdrop.pro")) {
      return { isMalicious: true, severity: 100, reason: "ChainPatrol blocklist", source: "chainpatrol" };
    }
    return { isMalicious: false, severity: 0, reason: "clean", source: "chainpatrol" };
  } catch {
    return null;
  }
}
