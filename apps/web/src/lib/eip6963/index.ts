export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: unknown;
}

export interface EIP6963AnnounceEvent extends Event {
  detail: EIP6963ProviderDetail;
}

const providers = new Map<string, EIP6963ProviderDetail>();
const announceCbs: Array<(d: EIP6963ProviderDetail) => void> = [];

export function announceProvider(detail: EIP6963ProviderDetail): void {
  providers.set(detail.info.uuid, detail);
  for (const cb of announceCbs) cb(detail);
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    const event = new CustomEvent("eip6963:announceProvider", { detail });
    window.dispatchEvent(event);
  }
}

export function requestProviders(): void {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }
}

export function onAnnounceProvider(cb: (detail: EIP6963ProviderDetail) => void): () => void {
  announceCbs.push(cb);
  if (typeof window !== "undefined") {
    const handler = (event: Event) => {
      const e = event as EIP6963AnnounceEvent;
      if (e.detail) {
        providers.set(e.detail.info.uuid, e.detail);
        cb(e.detail);
      }
    };
    window.addEventListener("eip6963:announceProvider", handler);
    return () => {
      const idx = announceCbs.indexOf(cb);
      if (idx >= 0) announceCbs.splice(idx, 1);
      window.removeEventListener("eip6963:announceProvider", handler);
    };
  }
  return () => {
    const idx = announceCbs.indexOf(cb);
    if (idx >= 0) announceCbs.splice(idx, 1);
  };
}

export function getProviders(): EIP6963ProviderDetail[] {
  return Array.from(providers.values());
}

export function getInjectedProvider(): unknown {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: unknown }).ethereum ?? null;
}

export function resetEIP6963ForTest(): void {
  providers.clear();
  announceCbs.length = 0;
}
