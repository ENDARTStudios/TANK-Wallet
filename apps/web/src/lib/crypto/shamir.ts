function gf256Mul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

function gf256Div(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  const inv = (() => {
    for (let x = 1; x < 256; x++) if (gf256Mul(x, b) === 1) return x;
    return 0;
  })();
  return gf256Mul(a, inv);
}

function evalPoly(coeffs: number[], x: number): number {
  let y = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) y = gf256Mul(y, x) ^ coeffs[i];
  return y;
}

export function splitSecret({ secret, threshold, shares }: { secret: string; threshold: number; shares: number }): string[] {
  if (threshold < 2 || threshold > shares) throw new Error("Invalid threshold");
  const data = Buffer.from(secret, "utf8");
  const out: string[] = [];
  for (let i = 0; i < shares; i++) out.push("");
  for (const byte of data) {
    const coeffs = [byte];
    for (let i = 1; i < threshold; i++) coeffs.push(Math.floor(Math.random() * 256));
    for (let i = 0; i < shares; i++) {
      const y = evalPoly(coeffs, i + 1);
      out[i] += y.toString(16).padStart(2, "0");
    }
  }
  return out;
}

export function combineShares({ shares, threshold }: { shares: string[]; threshold: number }): string {
  if (shares.length < threshold) throw new Error("Not enough shares");
  const len = shares[0].length / 2;
  let out = "";
  for (let i = 0; i < len; i++) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let j = 0; j < threshold; j++) {
      xs.push(j + 1);
      ys.push(parseInt(shares[j].slice(i * 2, i * 2 + 2), 16));
    }
    let secret = 0;
    for (let j = 0; j < threshold; j++) {
      let num = 1;
      let den = 1;
      for (let k = 0; k < threshold; k++) {
        if (k !== j) {
          num = gf256Mul(num, xs[k]);
          den = gf256Mul(den, xs[j] ^ xs[k]);
        }
      }
      const l = gf256Div(num, den);
      secret ^= gf256Mul(ys[j], l);
    }
    out += secret.toString(16).padStart(2, "0");
  }
  return Buffer.from(out, "hex").toString("utf8");
}
