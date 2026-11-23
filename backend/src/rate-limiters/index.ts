import { Request } from "express";
import rateLimit, { ipKeyGenerator, Options } from "express-rate-limit";
import { AuthRequest } from "../middleware";

const base: Partial<Options> = {
    standardHeaders: "draft-8",
    legacyHeaders: false,
};

function message(text: string) {
    return { error: text };
}

/** Key by signed-in user when known (limiter placed after requireAuth), else by IP. */
function userOrIp(req: Request): string {
    return (req as AuthRequest).userId ?? ipKeyGenerator(req.ip ?? "");
}

/** Safety net for every API route. */
export const apiLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: message("Too many requests. Please slow down and try again shortly."),
});

/** Only failed sign-in attempts count, so normal use never hits it. */
export const loginLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    message: message("Too many sign-in attempts. Please try again in 15 minutes."),
});

export const signupLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: message("Too many accounts created from this network. Please try again later."),
});

export const readLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 60,
    message: message("Too many requests. Please wait a moment."),
});

export const writeLimiter = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 30,
    keyGenerator: userOrIp,
    message: message("You're saving very quickly. Please wait a few minutes."),
});

const aiPerUser = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 5,
    keyGenerator: userOrIp,
    message: message("You've reached the AI writing limit (5 per hour). Please try again later."),
});

const summaryPerUser = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 20,
    keyGenerator: userOrIp,
    message: message("You've reached the summary limit for now. Please try again later."),
});

/*
 * Per-network caps that sit next to the per-account ones above. Without them,
 * one person with many accounts gets many quotas, and can drain the shared AI
 * budget (publishing runs a content check, so that would block everyone).
 */
const writePerIp = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 60,
    message: message("Too many saves from this network. Please wait a few minutes."),
});

const aiPerIp = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 15,
    message: message("This network has reached the AI writing limit for now. Please try again later."),
});

const summaryPerIp = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 60,
    message: message("This network has reached the summary limit for now. Please try again later."),
});

/** Saving and publishing: per account and per network. */
export const writeLimiters = [writePerIp, writeLimiter];
/** "Draft with AI": per account and per network. */
export const aiLimiter = [aiPerIp, aiPerUser];
/** Article summaries: per reader and per network. */
export const summaryLimiter = [summaryPerIp, summaryPerUser];

export const reportLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 10,
    keyGenerator: userOrIp,
    message: message("You've sent a lot of reports. Please try again later."),
});
