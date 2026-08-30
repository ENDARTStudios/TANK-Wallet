export interface BlowfishResult { isMalicious: boolean; severity: number; reason: string }

export async function scanTransaction({ chain, to, data }: { chain: string; to: string; data: string }): Promise<BlowfishResult | null> {
  const key = process.env.BLOWFISH_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.blowfish.xyz/v0/scan/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify({ chain, to, data }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { warnings?: { severity: number; message: string }[] };
    const w = json.warnings?.[0];
    if (w) return { isMalicious: true, severity: w.severity, reason: w.message };
    return { isMalicious: false, severity: 0, reason: "clean" };
  } catch {
    return null;
  }
}
