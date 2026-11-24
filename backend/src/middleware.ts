import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "./env";
import { prisma } from "./lib/prisma";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: Role;
}

export function signToken(userId: string): string {
    return jwt.sign({ id: userId }, env.jwtSecret, {
        algorithm: "HS256",
        expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    });
}

/** Returns the user id from a valid Bearer token, or null. */
function readUserId(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return null;

    try {
        const payload = jwt.verify(header.slice(7), env.jwtSecret, {
            algorithms: ["HS256"],
            // Also cap age by issue time, in case a token carries a far-off expiry.
            maxAge: env.jwtExpiresIn,
        });
        // Tokens from the old backend had no expiry and would work forever, so
        // only accept tokens that have one. Their holders just sign in again.
        if (typeof payload === "object" && typeof payload.id === "string" && typeof payload.exp === "number") {
            return payload.id;
        }
    } catch {
        // Expired or tampered token: treat as signed out.
    }
    return null;
}

/**
 * Require a signed-in user. Pass a role to restrict the route to that role;
 * omit it to allow any signed-in user.
 */
export function requireAuth(role?: Role) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = readUserId(req);
        if (!userId) {
            return res.status(401).json({ error: "Please sign in to continue." });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) {
            return res.status(401).json({ error: "Your session has expired. Please sign in again." });
        }
        if (role && user.role !== role) {
            return res.status(403).json({ error: "You don't have permission to do that." });
        }

        req.userId = userId;
        req.userRole = user.role;
        next();
    };
}

/** Attach the user id when a valid token is present, without requiring one. */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
    const userId = readUserId(req);
    if (userId) req.userId = userId;
    next();
}
