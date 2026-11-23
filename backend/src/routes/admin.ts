import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { withPreview } from "../lib/html";
import { AuthRequest, requireAuth } from "../middleware";
import { invalidateFeed } from "./blog";

export const adminRouter = Router();

adminRouter.use(requireAuth("admin"));

adminRouter.get("/all-details", async (_req: AuthRequest, res: Response) => {
    const [totalUsers, totalBlogs, reportedBlogs] = await Promise.all([
        prisma.user.count(),
        prisma.post.count({ where: { status: "published" } }),
        prisma.post.count({ where: { status: "published", isReported: true } }),
    ]);

    res.json({ totalUsers, totalBlogs, reportedBlogs });
});

adminRouter.get("/reported", async (_req: AuthRequest, res: Response) => {
    const posts = await prisma.post.findMany({
        where: { status: "published", isReported: true },
        orderBy: [{ numberOfReports: "desc" }, { date: "desc" }],
        take: 100,
        select: {
            id: true,
            title: true,
            content: true,
            date: true,
            labels: true,
            status: true,
            authorId: true,
            numberOfReports: true,
            author: { select: { name: true, avatar: true, bio: true } },
            _count: { select: { likes: true } },
        },
    });

    res.json({ posts: posts.map(withPreview) });
});

// Keep the post up and clear its reports
adminRouter.post("/:id/dismiss", async (req: AuthRequest, res: Response) => {
    const result = await prisma.post.updateMany({
        where: { id: req.params.id },
        data: { isReported: false, numberOfReports: 0 },
    });
    if (result.count === 0) throw new HttpError(404, "Post not found.");

    res.json({ success: true });
});

// Take a post down
adminRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    const result = await prisma.post.updateMany({
        where: { id: req.params.id, status: "published" },
        data: { status: "removed" },
    });
    if (result.count === 0) throw new HttpError(404, "Post not found.");

    invalidateFeed();
    res.json({ success: true });
});
