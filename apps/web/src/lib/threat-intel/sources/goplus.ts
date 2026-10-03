export interface GoPlusResult { isMalicious: boolean; severity: number; reason: string; source: string }

export async function checkGoPlus(chain: string, address: string, signal?: AbortSignal): Promise<GoPlusResult | null> {
  try {
    const url = `/api/goplus/token?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { is_honeypot?: boolean; is_malicious?: boolean; severity?: number; reason?: string };
    if (data.is_honeypot || data.is_malicious) {
      return { isMalicious: true, severity: data.severity ?? 90, reason: data.reason ?? "GoPlus flagged", source: "goplus" };
    }
    return { isMalicious: false, severity: 0, reason: "clean", source: "goplus" };
  } catch {
    return null;
  }
}
