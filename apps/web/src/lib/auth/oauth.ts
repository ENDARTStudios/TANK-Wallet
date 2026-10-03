export interface OAuthProvider { id: string; name: string; authorizeUrl: string; tokenUrl: string; clientId: string; clientSecret: string }

export function googleProvider(clientId: string, clientSecret: string): OAuthProvider {
  return { id: "google", name: "Google", authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", clientId, clientSecret };
}

export function appleProvider(clientId: string, clientSecret: string): OAuthProvider {
  return { id: "apple", name: "Apple", authorizeUrl: "https://appleid.apple.com/auth/authorize", tokenUrl: "https://appleid.apple.com/auth/token", clientId, clientSecret };
}

export function getAuthorizeUrl(provider: OAuthProvider, state: string, redirectUri: string): string {
  const u = new URL(provider.authorizeUrl);
  u.searchParams.set("client_id", provider.clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("response_type", "code");
  return u.toString();
}
