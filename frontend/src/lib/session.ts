// localStorage can throw (private mode, blocked storage), so every access is guarded.
const TOKEN_KEY = "token";

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Session will last until the tab closes.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * Only allow paths on this site, so ?next= can't redirect off-site.
 * Resolve with the URL parser instead of string checks: browsers strip tabs and
 * newlines and treat "\" as "/", so "/\t/evil.com" would become "//evil.com".
 */
export function safeRedirectPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/")) return null;
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
