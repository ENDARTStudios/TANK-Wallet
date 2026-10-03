export interface Invoice { bolt11: string; paymentHash: string; amount: number; memo?: string }

export function createInvoice({ amount, memo }: { amount: number; memo?: string }): Invoice {
  const hash = `hash_${amount}_${Date.now()}`.slice(0, 32);
  const bolt11 = `lnbc${amount}n1p${hash}${memo ? `_${memo.slice(0, 10)}` : ""}`;
  return { bolt11, paymentHash: hash, amount, memo };
}

export function payInvoice(bolt11: string): { success: boolean; preimage?: string } {
  if (!bolt11.startsWith("lnbc")) return { success: false };
  return { success: true, preimage: `preimage_${bolt11.slice(4, 12)}` };
}

export function submarineSwap({ from, to, amount }: { from: "btc" | "lightning"; to: "btc" | "lightning"; amount: number }): { swapId: string; from, to, amount } {
  return { swapId: `swap_${Date.now()}`, from, to, amount };
}
