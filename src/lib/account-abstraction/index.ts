export interface SmartAccount { address: `0x${string}`; factory: `0x${string}`; owner: `0x${string}`; salt: string }
export interface UserOperation { sender: `0x${string}`; nonce: string; callData: `0x${string}`; signature?: `0x${string}` }

export function createSmartAccount({ owner, salt }: { owner: `0x${string}`; salt?: string }): SmartAccount {
  const s = salt ?? `salt_${Date.now()}`;
  const hash = `0x${s.slice(0, 8).padEnd(40, "0")}` as `0x${string}`;
  return { address: hash, factory: "0xFactory000000000000000000000000000000000000", owner, salt: s };
}

export function createUserOperation({ sender, callData }: { sender: `0x${string}`; callData: `0x${string}` }): UserOperation {
  return { sender, nonce: "0x0", callData };
}

export function sponsorUserOp(op: UserOperation): UserOperation {
  return { ...op, signature: "0xsponsored" as `0x${string}` };
}
