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

adminRouter.delete('/:id', requireAuth("admin"), async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    try {
        const blog = await prisma.post.findUnique({
            where: { id }
        })

        if (!blog) {
            return res.status(400).json({ error: "Post not found" })
        }

        await prisma.post.update({
            where: { id },
            data: { status: "removed" }
        })

        return res.json({ success: true })
    } catch (error) {
        return res.status(400).json({ error: 'Error in deleting post' })
    }
})

