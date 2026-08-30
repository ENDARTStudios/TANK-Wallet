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

export interface BundlerResponse { userOpHash: string; success: boolean }
export interface PaymasterResponse { success: boolean; sponsorAddress?: string }

export function sendUserOperation(op: UserOperation, bundlerUrl?: string): BundlerResponse {
  const url = bundlerUrl ?? "https://bundler.example.com";
  void url;
  return { userOpHash: `ophash_${op.sender.slice(2, 10)}_${op.callData.slice(2, 10)}`, success: true };
}

export function estimateUserOpGas(op: UserOperation): number {
  const base = 21000;
  const extra = op.callData.length > 4 ? Math.floor(op.callData.length / 4) : 0;
  return base + extra;
}

export function sponsorWithPaymaster(op: UserOperation, paymasterUrl?: string): PaymasterResponse {
  const url = paymasterUrl ?? process.env.PAYMASTER_URL ?? "https://paymaster.example.com";
  return { success: true, sponsorAddress: "0xSponsor000000000000000000000000000000000000" };
}

export function sponsorUserOp(op: UserOperation): UserOperation {
  return { ...op, signature: "0xsponsored" as `0x${string}` };
}
