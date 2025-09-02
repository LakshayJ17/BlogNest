import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    userId?: string;
}

export function requireAuth(role: "admin" | "user") {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        let userId;

        try {
            const payload = jwt.verify(token, JWT_SECRET) as { id: string };
            userId = payload.id;
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id : userId
            },
            select: {
                role: true
            }
        })

        if (!user || user.role !== role){
            return res.status(403).json({error : "Unauthorized"})
        }

        req.userId = userId;
        next();
    }
}