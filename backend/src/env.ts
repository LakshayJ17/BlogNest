// Load .env before anything reads process.env. Every module that needs
// configuration imports `env` from here, so load order is guaranteed.
import "dotenv/config";
import { randomBytes } from "crypto";

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);

function fail(message: string): never {
    console.error(`\n[config] ${message}\n[config] See backend/.env.example for every setting.\n`);
    process.exit(1);
}

function resolveJwtSecret(): string {
    const value = process.env.JWT_SECRET;
    if (value) return value;

    if (isProduction) {
        fail("JWT_SECRET is not set. Refusing to start: sessions can't be signed securely.");
    }

    // Local development only: boot anyway with a throwaway secret.
    console.warn(
        "[config] JWT_SECRET is not set. Using a temporary random secret for this run, so you'll be signed out on every restart. Add JWT_SECRET to backend/.env to keep sessions."
    );
    return randomBytes(48).toString("base64");
}

if (!process.env.DATABASE_URL) {
    if (isProduction) fail("DATABASE_URL is not set.");
    console.warn("[config] DATABASE_URL is not set. Any request that touches the database will fail. Add it to backend/.env.");
}

const jwtSecret = resolveJwtSecret();
if (jwtSecret.length < 32) {
    console.warn(
        "[security] JWT_SECRET is shorter than 32 characters. Generate a long random value, for example: openssl rand -base64 48"
    );
}

const DEFAULT_ORIGINS = [
    "https://blognest-project.vercel.app",
    "https://blognest.bylakshayjain.online",
    // The local dev site is only trusted when running locally.
    ...(isProduction ? [] : ["http://localhost:5173"]),
];

const trustProxyRaw = process.env.TRUST_PROXY ?? "1";

export const env = {
    port: Number(process.env.PORT) || 8787,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : DEFAULT_ORIGINS,
    // Number of reverse proxies in front of the app (Render, Railway, etc. use 1).
    // Needed so rate limiting sees the real client IP instead of the proxy's.
    trustProxy: /^\d+$/.test(trustProxyRaw) ? Number(trustProxyRaw) : trustProxyRaw,
};
