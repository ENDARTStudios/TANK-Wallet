export type BotMode = "monitor" | "block";

export interface BotSignal {
  isBot: boolean;
  score: number;
  reasons: string[];
}

const SUSPICIOUS_UA = ["curl", "wget", "python", "headless", "puppeteer", "phantomjs", "selenium", "bot", "spider", "crawl"];

export function analyzeBotSignal(req: { headers: Headers }): BotSignal {
  const reasons: string[] = [];
  let score = 0;

  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  const acceptLang = req.headers.get("accept-language") ?? "";
  const secFetchSite = req.headers.get("sec-fetch-site") ?? "";
  const secFetchMode = req.headers.get("sec-fetch-mode") ?? "";

  if (!ua) {
    score += 40;
    reasons.push("missing_user_agent");
  } else {
    for (const pat of SUSPICIOUS_UA) {
      if (ua.includes(pat)) {
        score += 50;
        reasons.push(`suspicious_ua:${pat}`);
        break;
      }
    }
    if (ua.length < 10) {
      score += 20;
      reasons.push("ua_too_short");
    }
  }

  if (!acceptLang) {
    score += 20;
    reasons.push("missing_accept_language");
  }

  if (!secFetchSite && !secFetchMode) {
    score += 15;
    reasons.push("missing_sec_fetch");
  }

  const isBot = score >= 50;
  return { isBot, score: Math.min(100, score), reasons };
}

export function getBotMode(): BotMode {
  const raw = (process.env.BOT_MODE ?? "monitor").toLowerCase();
  return raw === "block" ? "block" : "monitor";
}

export function shouldBlockBot(signal: BotSignal, mode: BotMode = getBotMode()): boolean {
  return mode === "block" && signal.isBot;
}
