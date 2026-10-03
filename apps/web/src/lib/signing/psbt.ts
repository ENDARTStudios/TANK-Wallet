export interface PsbtInput { txId: string; vout: number; value: number; address: string }
export interface PsbtOutput { address: string; value: number }

export async function createPsbt(network?: unknown): Promise<unknown> {
  const bitcoin = await import("bitcoinjs-lib");
  const net = (network as never) ?? (bitcoin.networks as unknown as { bitcoin: unknown }).bitcoin;
  return new (bitcoin as unknown as { Psbt: new (opts: unknown) => unknown }).Psbt({ network: net });
}

export async function addInput(psbt: unknown, input: PsbtInput): Promise<void> {
  await import("bitcoinjs-lib");
  (psbt as { addInput: (opts: unknown) => void }).addInput({
    hash: input.txId,
    index: input.vout,
    witnessUtxo: { script: Buffer.from("0014" + "00".repeat(20), "hex"), value: input.value },
  });
}

export async function addOutput(psbt: unknown, output: PsbtOutput): Promise<void> {
  await import("bitcoinjs-lib");
  (psbt as { addOutput: (opts: unknown) => void }).addOutput({ address: output.address, value: output.value });
}

export async function getPsbtBase64(psbt: unknown): Promise<string> {
  await import("bitcoinjs-lib");
  return (psbt as { toBase64: () => string }).toBase64();
}

export function isTaprootAddress(address: string): boolean {
  return address.startsWith("bc1p") || address.startsWith("tb1p");
}

export function isSegWitAddress(address: string): boolean {
  return address.startsWith("bc1q") || address.startsWith("tb1q") || isTaprootAddress(address);
}
