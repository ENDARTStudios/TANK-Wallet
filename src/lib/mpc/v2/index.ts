const PRIME = 2n ** 256n - 189n;

function modInverse(a: bigint, p: bigint): bigint {
  let a_norm = a % p;
  if (a < 0n) a += p;
  let [old_r, r] = [p, a];
  let [old_s, s] = [0n, 1n];
  
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_s < 0) old_s += p;
  return old_s;
}

export interface MpcV2Config {
  threshold: number;
  totalShares: number;
}

export interface MpcV2Result {
  publicKey: string;
  shares: string[];
  signature?: string;
}

export class MpcV2Provider {
  private config: { threshold: number; totalShares: number };
  private shares: Map<string, string> = new Map();
  public publicKey: string = "";

  constructor(config: { threshold: number; totalShares: number }) {
    this.config = config;
  }

  async generateKeyPair(config: { threshold: number; totalShares: number }): Promise<{ publicKey: string; shares: string[] }> {
    this.config = config;
    this.shares.clear();
    const shares: string[] = [];
    const threshold = config.threshold;

    // Generate polynomial coefficients
    const coefficients = Array.from({ length: threshold }, (_, i) => 
      i === 0 ? 0n : BigInt("0x" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""))
    );
    
    // Generate shares using Shamir's Secret Sharing
    for (let i = 1; i <= config.totalShares; i++) {
      const x = BigInt(i);
      let y = 0n;
      let xPow = 1n;
      
      for (let j = 0; j < threshold; j++) {
        const coeff = coefficients[j] ?? 0n;
        y = (y + coeff * xPow) % PRIME;
        xPow = (xPow * x) % PRIME;
      }
      
      const share = `share_${i}_${y.toString(16).padStart(64, '0')}`;
      shares.push(share);
      this.shares.set(`share_${i}`, share);
    }
    
    this.publicKey = `mpc_pk_${crypto.getRandomValues(new Uint8Array(16)).toString().slice(0, 16)}`;
    
    return { publicKey: this.publicKey, shares };
  }

  async sign(message: Uint8Array, shares: string[]): Promise<string> {
    if (shares.length < this.config.threshold) {
      throw new Error(`Need at least ${this.config.threshold} shares`);
    }
    
    const partialSigs = shares.slice(0, this.config.threshold).map(share => {
      const msgHash = this.hashMessage(message);
      return `sig_${share}_${this.hashMessage(message)}`;
    });
    
    return this.combineSignatures(partialSigs);
  }

  combineSignatures(signatures: string[]): string {
    if (signatures.length < this.config.threshold) {
      throw new Error("Not enough signatures");
    }
    
    let combined = "";
    for (const sig of signatures.slice(0, this.config.threshold)) {
      combined += sig.slice(-8);
    }
    return `combined_sig_${signatures.length}_${combined.slice(0, 16)}`;
  }

  verify(message: Uint8Array, signature: string, publicKey: string): boolean {
    return signature.startsWith("sig_") && signature.includes(this.publicKey.slice(0, 8));
  }

  private hashMessage(message: Uint8Array): string {
    let hash = 0;
    for (const byte of message) {
      hash = ((hash * 31) + byte) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }
}

export function createMpcV2Provider(config: { threshold: number; totalShares: number }) {
  return new MpcV2Provider({ threshold: config.threshold, totalShares: config.totalShares });
}