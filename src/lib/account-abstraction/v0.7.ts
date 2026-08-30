export interface PackedUserOp { sender: `0x${string}`; nonce: string; initCode: `0x${string}`; callData: `0x${string}`; accountGasLimits: `0x${string}`; preVerificationGas: string; gasFees: `0x${string}`; paymasterAndData: `0x${string}`; signature: `0x${string}` }

export function packUserOp(op: { sender: `0x${string}`; nonce: string; callData: `0x${string}`; signature?: `0x${string}` }): PackedUserOp {
  return {
    sender: op.sender,
    nonce: op.nonce,
    initCode: "0x" as `0x${string}`,
    callData: op.callData,
    accountGasLimits: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
    preVerificationGas: "0x0",
    gasFees: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
    paymasterAndData: "0x" as `0x${string}`,
    signature: (op.signature ?? "0x") as `0x${string}`,
  };
}

export function unpackUserOp(p: PackedUserOp): { sender: `0x${string}`; nonce: string; callData: `0x${string}`; signature: `0x${string}` } {
  return { sender: p.sender, nonce: p.nonce, callData: p.callData, signature: p.signature };
}

export function getUserOpHash(op: PackedUserOp, entryPoint: `0x${string}`, chainId: number): `0x${string}` {
  let h = chainId;
  for (let i = 0; i < op.sender.length; i++) h = (h * 31 + op.sender.charCodeAt(i)) >>> 0;
  for (let i = 0; i < entryPoint.length; i++) h = (h * 31 + entryPoint.charCodeAt(i)) >>> 0;
  for (let i = 0; i < op.nonce.length; i++) h = (h * 31 + op.nonce.charCodeAt(i)) >>> 0;
  return `0x${h.toString(16).padStart(64, "0").slice(0, 64)}`;
}
