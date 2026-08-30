const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "github_pat", re: /github_pat_[A-Za-z0-9_]+/g },
  { name: "github_token", re: /ghp_[A-Za-z0-9]{36,}/g },
  { name: "slack_token", re: /xox[baprs]-[A-Za-z0-9-]+/g },
  { name: "private_key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/g },
  { name: "bearer", re: /Bearer\s+[A-Za-z0-9._-]+/g },
  { name: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
];

export function redactSecrets(input: string): string {
  let out = input;
  for (const { name, re } of PATTERNS) {
    out = out.replace(re, `[REDACTED:${name}]`);
  }
  return out;
}

export function redactObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result[k] = redactSecrets(v);
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      result[k] = redactObject(v as Record<string, unknown>);
    } else {
      result[k] = v;
    }
  }
  return result as T;
}
