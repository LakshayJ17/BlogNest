import { Router, Response } from "express";
import { AdminActionType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { withPreview } from "../lib/html";
import { AuthRequest, requireAuth } from "../middleware";
import { invalidateFeed } from "./blog";

export const adminRouter = Router();

adminRouter.use(requireAuth("admin"));

/** What the audit log keeps about a post, as it was when the action happened. */
const auditSelect = { id: true, title: true, authorId: true, numberOfReports: true } as const;
type AuditPost = Prisma.PostGetPayload<{ select: typeof auditSelect }>;

/**
 * Record a moderation action. Always call this inside the same transaction as
 * the change itself, so a change can't happen without its log entry.
 */
function logAction(tx: Prisma.TransactionClient, adminId: string, action: AdminActionType, post: AuditPost) {
    return tx.adminAction.create({
        data: {
            adminId,
            action,
            postId: post.id,
            details: { title: post.title, authorId: post.authorId, reportsAtAction: post.numberOfReports },
        },
    });
}

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

// Recent moderation actions, newest first
adminRouter.get("/actions", async (_req: AuthRequest, res: Response) => {
    const actions = await prisma.adminAction.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
            id: true,
            action: true,
            postId: true,
            details: true,
            createdAt: true,
            admin: { select: { name: true } },
        },
    });

    res.json({ actions });
});

// Keep the post up and clear its reports
adminRouter.post("/:id/dismiss", async (req: AuthRequest, res: Response) => {
    await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({ where: { id: req.params.id }, select: auditSelect });
        if (!post) throw new HttpError(404, "Post not found.");

        await tx.post.update({ where: { id: post.id }, data: { isReported: false, numberOfReports: 0 } });
        // Clear the per-reader rows too, so the count and the rows agree.
        await tx.report.deleteMany({ where: { postId: post.id } });
        await logAction(tx, req.userId!, "dismiss_reports", post);
    });

    res.json({ success: true });
});

// Take a post down
adminRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    await prisma.$transaction(async (tx) => {
        const result = await tx.post.updateMany({
            where: { id: req.params.id, status: "published" },
            data: { status: "removed" },
        });
        if (result.count === 0) throw new HttpError(404, "Post not found.");

        const post = await tx.post.findUniqueOrThrow({ where: { id: req.params.id }, select: auditSelect });
        await logAction(tx, req.userId!, "remove_post", post);
    });

    invalidateFeed();
    res.json({ success: true });
});
