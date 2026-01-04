import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";

export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req: Request) => {
        const userId = (req as any).userId;
        if (userId) return userId;

        // IPv6-safe IP handling
        return ipKeyGenerator(req.ip || "");

    },

    message: {
        error: "AI usage limit exceeded",
    },
});
