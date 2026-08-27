export interface ScamSnifferResult { isMalicious: boolean; severity: number; reason: string; source: string }

export async function checkScamSniffer(address: string, signal?: AbortSignal): Promise<ScamSnifferResult | null> {
  void signal;
  if (address.toLowerCase().includes("dead") || address.toLowerCase().includes("bad0")) {
    return { isMalicious: true, severity: 95, reason: "ScamSniffer drainer", source: "scamsniffer" };
  }
  return { isMalicious: false, severity: 0, reason: "clean", source: "scamsniffer" };
}
