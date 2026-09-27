import { z } from "zod";
import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";

export const IntentSchema = z.object({
  chain: z.string().min(1).max(64).optional(),
  address: z.string().min(1).max(128).optional(),
  selector: z.string().regex(/^0x[0-9a-fA-F]{8}$/).optional(),
  value: z.string().regex(/^\d+$/).max(78).optional(),
  dappOrigin: z.string().regex(/^[a-z0-9.-]+$/i).max(253).optional(),
}).refine((v) => v.chain !== undefined || v.address !== undefined || v.selector !== undefined || v.value !== undefined || v.dappOrigin !== undefined, {
  message: "at least one signal field required",
});

export type IntentInput = z.infer<typeof IntentSchema>;

export type IntentKind = "send" | "swap" | "approve" | "stake" | "bridge" | "unclassified";
export type IntentSource = "typesafe" | "local-heuristic" | "unavailable";

export interface IntentResult {
  intent: IntentKind;
  confidence: number;
  source: IntentSource;
}

export interface IntentClient {
  systemOne(
    request: { state: Record<string, unknown>; questions: Record<string, unknown> },
    options?: { timeout?: number },
  ): Promise<{
    answers: {
      intent: { choice: string; confidence: number };
      clear: { noul: number };
    };
  }>;
}

interface ClassifyOptions {
  enabled?: boolean;
  assess?: IntentClient;
  timeoutMs?: number;
}

const SELECTOR_ALLOWLIST: Record<string, IntentKind> = {
  "0xa9059cbb": "send",
  "0x095ea7b3": "approve",
  "0x7ff36ab5": "swap",
  "0x38ed1739": "swap",
  "0x18cbafe5": "swap",
  "0xa694fc3a": "stake",
};

const INTENT_LEVELS = ["send", "swap", "approve", "stake", "bridge", "unclassified"] as const;
export const INTENT_TIMEOUT_MS = 3000;
const CLEAR_THRESHOLD = 0.5;

export function isIntentFlagOn(env: Record<string, string | undefined> = process.env): boolean {
  const raw = env.INTENT_ROUTING_ENABLED;
  if (raw === undefined) return false;
  return raw === "1" || raw.toLowerCase() === "true";
}

function localHeuristic(input: IntentInput): IntentResult | null {
  if (input.selector === undefined) return null;
  const intent = SELECTOR_ALLOWLIST[input.selector.toLowerCase()];
  if (intent === undefined) return null;
  return { intent, confidence: 1, source: "local-heuristic" };
}

const unavailable = (): IntentResult => ({ intent: "unclassified", confidence: 0, source: "unavailable" });

export async function classifyIntent(rawInput: unknown, opts?: ClassifyOptions): Promise<IntentResult> {
  const parsed = IntentSchema.safeParse(rawInput);
  if (!parsed.success) return unavailable();
  const input = parsed.data;
  const enabled = opts?.enabled ?? isIntentFlagOn();
  if (!enabled) return unavailable();
  const local = localHeuristic(input);
  if (local !== null) return local;
  const client = opts?.assess ?? (new TypeSafeClient() as unknown as IntentClient);
  const timeoutMs = opts?.timeoutMs ?? INTENT_TIMEOUT_MS;
  try {
    const response = await Promise.race([
      client.systemOne(
        {
          state: {
            chain: input.chain ?? null,
            contract_address: input.address ?? null,
            function_selector: input.selector ?? null,
            value_wei: input.value ?? null,
            dapp_origin: input.dappOrigin ?? null,
          },
          questions: {
            intent: choice("Which transaction intent best matches `function_selector` on `chain` for `dapp_origin`?", {
              send: "Native or token transfer to a recipient.",
              swap: "Token exchange on a DEX router.",
              approve: "ERC-20 allowance grant.",
              stake: "Staking deposit into a protocol.",
              bridge: "Cross-chain asset transfer.",
              unclassified: "None of the above fits.",
            }),
            clear: noul("Is the intended action unambiguous from `function_selector` and `dapp_origin`?", {
              true: "The intent is clear from selector and origin.",
              false: "The intent is ambiguous.",
            }),
          },
        },
        { timeout: timeoutMs },
      ),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("intent_timeout")), timeoutMs)),
    ]);
    const clear = response.answers.clear.noul;
    if (clear < CLEAR_THRESHOLD) return { intent: "unclassified", confidence: response.answers.intent.confidence, source: "typesafe" };
    const intent = response.answers.intent.choice as IntentKind;
    if (!INTENT_LEVELS.includes(intent)) return unavailable();
    return { intent, confidence: response.answers.intent.confidence, source: "typesafe" };
  } catch {
    return unavailable();
  }
}
