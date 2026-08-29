export interface MpcShare { id: string; share: string }

export function generateMpcShare(): MpcShare[] {
  const s1 = `share1_${Math.random().toString(36).slice(2, 10)}`;
  const s2 = `share2_${Math.random().toString(36).slice(2, 10)}`;
  return [
    { id: "1", share: s1 },
    { id: "2", share: s2 },
  ];
}

export function combineShares(shares: MpcShare[]): string {
  if (shares.length < 2) throw new Error("Need 2 shares");
  return `combined_${shares.map((s) => s.share.slice(0, 4)).join("")}`;
}

export function createPasskey(username: string): { id: string; username: string; publicKey: string } {
  return { id: `passkey_${Date.now()}`, username, publicKey: `pk_${username}_${Math.random().toString(36).slice(2, 8)}` };
}
