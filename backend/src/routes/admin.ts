import express from "express";
import { Response } from "express";
import { PrismaClient } from '@prisma/client'
import { AuthRequest, requireAuth } from "../middleware";

export const adminRouter = express.Router();

const prisma = new PrismaClient();

adminRouter.get('/all-details', requireAuth("admin"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const totalUsers = await prisma.user.count()
    const totalBlogs = await prisma.post.count()

    return res.json({
        totalUsers, totalBlogs
    })
})

