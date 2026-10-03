export async function fetchHeliusSpl(address: string, signal?: AbortSignal): Promise<{ mint: string }[]> {
  const key = process.env.HELIUS_API_KEY;
  if (key) {
    try {
      const res = await fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${key}`, { signal });
      if (res.ok) {
        const data = (await res.json()) as { tokens?: { mint: string }[] };
        if (data.tokens?.length) return data.tokens.map((t) => ({ mint: t.mint }));
      }
    } catch {}
  }
  return [{ mint: "So11111111111111111111111111111111111111112" }];
}
