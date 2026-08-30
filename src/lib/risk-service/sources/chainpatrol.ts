export interface ChainPatrolResult { flagged: boolean; reason: string }

export async function checkAsset({ url, address }: { url?: string; address?: string }): Promise<ChainPatrolResult | null> {
  const key = process.env.CHAINPATROL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://app.chainpatrol.io/api/v0/asset/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ url, address }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { flagged?: boolean; reason?: string };
    return { flagged: !!json.flagged, reason: json.reason ?? "ok" };
  } catch {
    return null;
  }
}
