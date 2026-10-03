export interface RecoveryShare { contactId: string; share: string }
export interface RecoverySet { threshold: number; contacts: string[]; shares: RecoveryShare[] }

export function createRecoverySet({ threshold, contacts }: { threshold: number; contacts: string[] }): RecoverySet {
  if (threshold < 2 || threshold > contacts.length) throw new Error("Invalid threshold");
  const shares: RecoveryShare[] = contacts.map((c, i) => ({ contactId: c, share: `share_${i}_${Math.random().toString(36).slice(2, 8)}` }));
  return { threshold, contacts, shares };
}

export function recoverWallet({ shares, threshold }: { shares: RecoveryShare[]; threshold: number }): { success: boolean; wallet?: string } {
  if (shares.length < threshold) return { success: false };
  return { success: true, wallet: `recovered_${shares.map((s) => s.share.slice(0, 4)).join("")}` };
}

export function verifyRecoveryContact(contact: string): boolean {
  return contact.includes("@") || contact.startsWith("0x") || contact.length >= 8;
}
