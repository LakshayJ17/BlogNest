import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "../config";

// Must be loaded from Cloudflare directly (no bundling or self-hosting).
// vercel.json allows this host in script-src.
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      // Allow a later attempt (for example after a blocker is turned off).
      loading = null;
      script.remove();
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Cloudflare Turnstile bot check. Reports a fresh token through onToken, or
 * null when the token expires or the check fails. Each token works once, so
 * bump resetKey after a failed submit to get a new one.
 */
export function Captcha({
  action,
  onToken,
  resetKey,
}: {
  action: "signup" | "signin";
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: "light",
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action]);

  useEffect(() => {
    if (resetKey === 0 || !widgetId.current || !window.turnstile) return;
    onTokenRef.current(null);
    window.turnstile.reset(widgetId.current);
  }, [resetKey]);

  return (
    <div>
      <div ref={container} className="min-h-[65px]" />
      {loadFailed && (
        <p role="alert" className="text-sm text-tag-red">
          The security check couldn't load. Check your connection, allow challenges.cloudflare.com if you use a
          blocker, and refresh the page.
        </p>
      )}
    </div>
  );
}
