export const BACKEND_URL: string =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? "http://localhost:8787" : "https://blognest-backend-yxsq.onrender.com");

export const SITE_URL = "https://blognest.bylakshayjain.online";

/** Cloudflare Turnstile site key for the signup and sign-in bot check. Empty hides the check. */
export const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
export const CAPTCHA_ENABLED = Boolean(TURNSTILE_SITE_KEY);
