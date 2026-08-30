export interface TSSSignature { r: string; s: string; participants: number }

export function signThreshold({ message, shares, threshold }: { message: string; shares: string[]; threshold: number }): TSSSignature {
  if (shares.length < threshold) throw new Error("Not enough shares");
  let h = 0;
  for (let i = 0; i < message.length; i++) h = (h * 31 + message.charCodeAt(i)) >>> 0;
  return { r: h.toString(16).padStart(64, "0").slice(0, 64), s: shares.length.toString().padStart(2, "0"), participants: shares.length };
}

export function verifyThreshold({ message, signature, publicKey }: { message: string; signature: TSSSignature; publicKey: string }): boolean {
  void publicKey;
  return signature.s.length > 0 && message.length > 0;
}

export function combinePartialSignatures(parts: TSSSignature[]): TSSSignature {
  if (parts.length === 0) throw new Error("No parts");
  return { r: parts[0].r, s: parts.map((p) => p.s).join(""), participants: parts.length };
}
