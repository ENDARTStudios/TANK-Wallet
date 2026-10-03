export async function signTypedData(privateKey: `0x${string}`, domain: unknown, types: unknown, message: unknown): Promise<`0x${string}`> {
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(privateKey);
  return (await (account as unknown as { signTypedData: (args: unknown) => Promise<string> }).signTypedData({ domain, types, primaryType: "Mail", message })) as `0x${string}`;
}

export async function signMessage(privateKey: `0x${string}`, message: string): Promise<`0x${string}`> {
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(privateKey);
  return (await (account as unknown as { signMessage: (args: unknown) => Promise<string> }).signMessage({ message })) as `0x${string}`;
}

export function hashMessage(message: string): `0x${string}` {
  let hash = 0;
  for (let i = 0; i < message.length; i++) hash = (hash * 31 + message.charCodeAt(i)) >>> 0;
  const hex = hash.toString(16).padStart(8, "0").repeat(8);
  return `0x${hex.slice(0, 64)}`;
}
