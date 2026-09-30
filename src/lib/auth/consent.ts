import { z } from "zod";

// §7/§9: aceite de Termos/Privacidade com evidência server-side (LEGAL-AUDIT).
export const consentSchema = z.object({
  termsVersion: z.string().min(1).max(64),
  privacyVersion: z.string().min(1).max(64),
});

export type ConsentInput = z.infer<typeof consentSchema>;

interface ConsentDb {
  user: {
    update(args: {
      where: { id: string };
      data: {
        termsAcceptedAt: Date;
        termsVersion: string;
        privacyAcceptedAt: Date;
        privacyVersion: string;
      };
    }): Promise<unknown>;
  };
}

// Timestamps são sempre server-side (a hora do cliente não é evidência confiável).
export async function recordConsent(
  db: ConsentDb,
  userId: string,
  input: ConsentInput,
  now = new Date(),
): Promise<{ termsAcceptedAt: Date; privacyAcceptedAt: Date }> {
  await db.user.update({
    where: { id: userId },
    data: {
      termsAcceptedAt: now,
      termsVersion: input.termsVersion,
      privacyAcceptedAt: now,
      privacyVersion: input.privacyVersion,
    },
  });
  return { termsAcceptedAt: now, privacyAcceptedAt: now };
}
