export interface TxStatus { hash: string; confirmations: number; reorged: boolean }

export function watchTransaction(hash: string, currentBlock: number, txBlock: number): TxStatus {
  const confirmations = currentBlock - txBlock;
  const reorged = confirmations < 0;
  return { hash, confirmations: Math.max(0, confirmations), reorged };
}

export function isFinalized(confirmations: number, finalityDepth = 12): boolean {
  return confirmations >= finalityDepth;
}
