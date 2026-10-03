export interface TenderlyResult { success: boolean; revert: boolean; gasUsed: string }

export async function simulateTransaction({ to, data, from }: { from: string; to: string; data: string }): Promise<TenderlyResult | null> {
  const key = process.env.TENDERLY_ACCESS_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.tenderly.co/api/v1/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Access-Key": key },
      body: JSON.stringify({ from, to, input: data, gas: 8000000 }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { transaction?: { status?: boolean; gas_used?: string } };
    return { success: true, revert: json.transaction?.status === false, gasUsed: json.transaction?.gas_used ?? "0" };
  } catch {
    return null;
  }
}
