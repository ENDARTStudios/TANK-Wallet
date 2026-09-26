const DEFAULT_BASE_URL = "https://tankwallet.dev";

function validUrl(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function resolveBaseUrl(env: Record<string, string | undefined> = process.env): string {
  const fromAuth = env.NEXTAUTH_URL !== undefined ? validUrl(env.NEXTAUTH_URL) : null;
  if (fromAuth !== null) return fromAuth;
  const vercelRaw = env.VERCEL_URL !== undefined ? env.VERCEL_URL.trim() : "";
  if (vercelRaw.length > 0) {
    const withScheme = vercelRaw.includes("://") ? vercelRaw : `https://${vercelRaw}`;
    const fromVercel = validUrl(withScheme);
    if (fromVercel !== null) return fromVercel;
  }
  return DEFAULT_BASE_URL;
}
