export interface SolanaTx { version: number; signatures: string[]; message: { header: unknown; instructions: unknown[] } }

export function createVersionedTx(payer: string, recentBlockhash: string): SolanaTx {
  return {
    version: 0,
    signatures: [],
    message: {
      header: { numRequiredSignatures: 1, numReadonlySignedAccounts: 0, numReadonlyUnsignedAccounts: 1 },
      instructions: [{ programId: payer, data: recentBlockhash }],
    },
  };
}

export function signVersionedTx(tx: SolanaTx, signature: string): SolanaTx {
  return { ...tx, signatures: [signature] };
}

export function isVersionedTx(tx: unknown): boolean {
  return typeof tx === "object" && tx !== null && "version" in (tx as Record<string, unknown>) && "signatures" in (tx as Record<string, unknown>);
}
