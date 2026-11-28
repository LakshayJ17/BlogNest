import { env } from "../env";
import { HttpError } from "./errors";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 8000;

export type CaptchaAction = "signup" | "signin";

interface SiteverifyResponse {
    success: boolean;
    action?: string;
    "error-codes"?: string[];
}

/**
 * Check the Cloudflare Turnstile token sent with a public form.
 *
 * Off until TURNSTILE_SECRET_KEY is set, so local development works without
 * it. Once on, it fails closed: no token, a bad token, or no answer from
 * Cloudflare all reject the request. Each token works only once.
 */
export async function verifyCaptcha(token: string | undefined, ip: string | undefined, action: CaptchaAction) {
    if (!env.turnstileSecret) return;
    if (!token) {
        throw new HttpError(400, "Please complete the security check.");
    }

    let result: SiteverifyResponse;
    try {
        const body = new URLSearchParams({ secret: env.turnstileSecret, response: token });
        if (ip) body.set("remoteip", ip);
        const response = await fetch(VERIFY_URL, {
            method: "POST",
            body,
            signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
        });
        result = (await response.json()) as SiteverifyResponse;
    } catch (error) {
        console.error("[captcha] verification request failed:", error);
        throw new HttpError(503, "We couldn't run the security check. Please try again in a moment.");
    }

    // A token made on the sign-in form must not be accepted for signup, and the reverse.
    if (!result.success || (result.action && result.action !== action)) {
        throw new HttpError(400, "The security check failed or expired. Please try it again.");
    }
}
