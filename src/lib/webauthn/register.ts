function randomBytes(len: number): Uint8Array {
  const b = new Uint8Array(len);
  for (let i = 0; i < len; i++) b[i] = (Math.random() * 256) | 0;
  return b;
}

function toBase64Url(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return Buffer.from(s, "binary").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateChallenge(): string {
  return toBase64Url(randomBytes(32));
}

export interface AttestationOptions { challenge: string; rp: { id: string; name: string }; user: { id: string; name: string; displayName: string }; pubKeyCredParams: { type: "public-key"; alg: number }[]; timeout: number }

export function buildAttestationOptions({ rpId, userName, userId, userDisplay }: { rpId: string; userName: string; userId: string; userDisplay: string }): AttestationOptions {
  return {
    challenge: generateChallenge(),
    rp: { id: rpId, name: "TANK Wallet" },
    user: { id: userId, name: userName, displayName: userDisplay },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
    timeout: 60000,
  };
}

export function verifyAttestation(attestation: { id: string; rawId: string; response: { clientDataJSON: string; attestationObject: string }; type: string }): { verified: boolean; credentialId: string } {
  if (attestation.type !== "public-key") return { verified: false, credentialId: "" };
  if (!attestation.id) return { verified: false, credentialId: "" };
  if (!attestation.response?.clientDataJSON) return { verified: false, credentialId: "" };
  return { verified: true, credentialId: attestation.id };
}
