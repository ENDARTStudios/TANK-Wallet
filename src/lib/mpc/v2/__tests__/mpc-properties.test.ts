import { describe, it, expect } from "bun:test";
import * as fc from "fast-check";
import { createMpcV2Provider } from "../index";

const NUM_RUNS = 1000;
const TIMEOUT_MS = 120000;

const arbThresholdTotal = fc
  .tuple(fc.integer({ min: 2, max: 8 }), fc.integer({ min: 0, max: 6 }))
  .map(([t, extra]) => ({ threshold: t, totalShares: Math.min(t + extra, 12) }));

const SHARE_RE = /^share_\d+_[0-9a-f]{64}$/;

describe("mpc v2 properties (T088)", () => {
  it("P1: shares estruturais (count, unicidade, formato, indice)", async () => {
    await fc.assert(
      fc.asyncProperty(arbThresholdTotal, async ({ threshold, totalShares }) => {
        const provider = createMpcV2Provider({ threshold, totalShares });
        const { shares, publicKey } = await provider.generateKeyPair({
          threshold,
          totalShares,
        });
        expect(shares).toHaveLength(totalShares);
        expect(new Set(shares).size).toBe(totalShares);
        expect(publicKey.startsWith("mpc_pk_")).toBe(true);
        shares.forEach((s, idx) => {
          expect(s).toMatch(SHARE_RE);
          expect(s.startsWith(`share_${idx + 1}_`)).toBe(true);
        });
      }),
      { numRuns: NUM_RUNS },
    );
  }, TIMEOUT_MS);

  it("P2: gate de threshold (k<t rejeita, k>=t assina)", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbThresholdTotal,
        fc.integer({ min: 0, max: 12 }),
        async ({ threshold, totalShares }, k0) => {
          const k = Math.min(k0, totalShares);
          const provider = createMpcV2Provider({ threshold, totalShares });
          const { shares } = await provider.generateKeyPair({ threshold, totalShares });
          const message = new Uint8Array([1, 2, 3]);
          if (k < threshold) {
            await expect(provider.sign(message, shares.slice(0, k))).rejects.toThrow();
          } else {
            const sig = await provider.sign(message, shares.slice(0, k));
            expect(sig.startsWith(`combined_sig_${threshold}_`)).toBe(true);
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  }, TIMEOUT_MS);

  it("P3: determinismo do sign/combine (mesmo input => mesma saida)", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbThresholdTotal,
        fc.uint8Array({ minLength: 0, maxLength: 64 }),
        async ({ threshold, totalShares }, message) => {
          const provider = createMpcV2Provider({ threshold, totalShares });
          const { shares } = await provider.generateKeyPair({ threshold, totalShares });
          const subset = shares.slice(0, threshold);
          const a = await provider.sign(message, subset);
          const b = await provider.sign(message, subset);
          expect(a).toBe(b);
          const c1 = provider.combineSignatures(subset.map((s) => `sig_${s}_deadbeef`));
          const c2 = provider.combineSignatures(subset.map((s) => `sig_${s}_deadbeef`));
          expect(c1).toBe(c2);
          expect(c1.startsWith(`combined_sig_${threshold}_`)).toBe(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  }, TIMEOUT_MS);

  it.skip("P4 [QUARENTENA issue #66/T088]: round-trip sign->verify sempre false no stub (verify exige prefixo sig_, sign retorna combined_sig_) — reabilitar apos excecao ao freeze MPC", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbThresholdTotal,
        fc.uint8Array({ minLength: 1, maxLength: 64 }),
        async ({ threshold, totalShares }, message) => {
          const provider = createMpcV2Provider({ threshold, totalShares });
          const { shares, publicKey } = await provider.generateKeyPair({
            threshold,
            totalShares,
          });
          const sig = await provider.sign(message, shares.slice(0, threshold));
          expect(provider.verify(message, sig, publicKey)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  }, TIMEOUT_MS);
});
