import { z } from "zod";

// §7/§9: aceite de Termos/Privacidade com evidência server-side (LEGAL-AUDIT).
export const consentSchema = z.object({
  termsVersion: z.string().min(1).max(64),
  privacyVersion: z.string().min(1).max(64),
});

export type ConsentInput = z.infer<typeof consentSchema>;

export interface ConsentUpdateArgs {
  where: { id: string };
  data: {
    termsAcceptedAt: Date;
    termsVersion: string;
    privacyAcceptedAt: Date;
    privacyVersion: string;
  };
}

// Timestamps são sempre server-side (a hora do cliente não é evidência confiável).
// Recebe a função de update em vez do client Prisma: o delegate genérico do
// Prisma não satisfaz structuralmente uma interface estreita (contravariância).
export async function recordConsent(
  updateUser: (args: ConsentUpdateArgs) => Promise<unknown>,
  userId: string,
  input: ConsentInput,
  now = new Date(),
): Promise<{ termsAcceptedAt: Date; privacyAcceptedAt: Date }> {
  const args: ConsentUpdateArgs = {
    where: { id: userId },
    data: {
      termsAcceptedAt: now,
      termsVersion: input.termsVersion,
      privacyAcceptedAt: now,
      privacyVersion: input.privacyVersion,
    },
  };
  await updateUser(args);
  return { termsAcceptedAt: now, privacyAcceptedAt: now };
}
