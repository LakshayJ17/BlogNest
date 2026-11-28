import { Router, Response } from "express";
import { AdminActionType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError, parseInput } from "../lib/errors";
import { withPreview } from "../lib/html";
import { adminUsersQuerySchema } from "../lib/validation";
import { AuthRequest, requireAuth } from "../middleware";
import { invalidateFeed, publicPost } from "./blog";

export const adminRouter = Router();

adminRouter.use(requireAuth("admin"));

/** What the audit log keeps about a post, as it was when the action happened. */
const auditSelect = { id: true, title: true, authorId: true, numberOfReports: true } as const;
type AuditPost = Prisma.PostGetPayload<{ select: typeof auditSelect }>;

interface LogEntry {
    action: AdminActionType;
    postId?: string;
    targetUserId?: string;
    details: Prisma.InputJsonObject;
}

/**
 * Record a moderation action. Always call this inside the same transaction as
 * the change itself, so a change can't happen without its log entry.
 */
function logAction(tx: Prisma.TransactionClient, adminId: string, entry: LogEntry) {
    return tx.adminAction.create({ data: { adminId, ...entry } });
}

function postEntry(action: AdminActionType, post: AuditPost): LogEntry {
    return {
        action,
        postId: post.id,
        details: { title: post.title, authorId: post.authorId, reportsAtAction: post.numberOfReports },
    };
}

adminRouter.get("/all-details", async (_req: AuthRequest, res: Response) => {
    const [totalUsers, totalBlogs, reportedBlogs] = await Promise.all([
        prisma.user.count(),
        prisma.post.count({ where: publicPost }),
        prisma.post.count({ where: { ...publicPost, isReported: true } }),
    ]);

    res.json({ totalUsers, totalBlogs, reportedBlogs });
});

adminRouter.get("/reported", async (_req: AuthRequest, res: Response) => {
    // Stories by suspended accounts are already hidden, so they leave the queue.
    const posts = await prisma.post.findMany({
        where: { ...publicPost, isReported: true },
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
            targetUserId: true,
            details: true,
            createdAt: true,
            admin: { select: { name: true } },
        },
    });

    res.json({ actions });
});

// Newest members, or the suspended ones
adminRouter.get("/users", async (req: AuthRequest, res: Response) => {
    const { filter } = parseInput(adminUsersQuerySchema, req.query);
    const suspended = filter === "suspended";

    const users = await prisma.user.findMany({
        where: suspended ? { suspendedAt: { not: null } } : {},
        orderBy: suspended ? { suspendedAt: "desc" } : { joinedAt: "desc" },
        take: 50,
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            joinedAt: true,
            role: true,
            suspendedAt: true,
            _count: { select: { posts: { where: { status: "published" } } } },
        },
    });

    res.json({ users });
});

// Suspend an account: it can't sign in, its sessions stop working, and its
// stories are hidden until the suspension is lifted.
adminRouter.post("/users/:id/suspend", async (req: AuthRequest, res: Response) => {
    const suspendedAt = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, name: true, role: true, suspendedAt: true },
        });
        if (!user) throw new HttpError(404, "Account not found.");
        // This also stops an admin from locking themselves out.
        if (user.role === "admin") throw new HttpError(400, "Admin accounts can't be suspended.");

        const now = new Date();
        const result = await tx.user.updateMany({
            where: { id: user.id, suspendedAt: null },
            data: { suspendedAt: now },
        });
        // Already suspended (a double click, or another admin got there first).
        if (result.count === 0) return user.suspendedAt ?? now;

        const hiddenStories = await tx.post.count({ where: { authorId: user.id, status: "published" } });
        await logAction(tx, req.userId!, {
            action: "suspend_user",
            targetUserId: user.id,
            details: { name: user.name, hiddenStories },
        });
        return now;
    });

    invalidateFeed();
    res.json({ suspendedAt });
});

// Lift a suspension: the account can sign in again and its stories come back.
adminRouter.post("/users/:id/unsuspend", async (req: AuthRequest, res: Response) => {
    await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true } });
        if (!user) throw new HttpError(404, "Account not found.");

        const result = await tx.user.updateMany({
            where: { id: user.id, suspendedAt: { not: null } },
            data: { suspendedAt: null },
        });
        if (result.count === 0) return;

        const restoredStories = await tx.post.count({ where: { authorId: user.id, status: "published" } });
        await logAction(tx, req.userId!, {
            action: "unsuspend_user",
            targetUserId: user.id,
            details: { name: user.name, restoredStories },
        });
    });

    invalidateFeed();
    res.json({ suspendedAt: null });
});

// Keep the post up and clear its reports
adminRouter.post("/:id/dismiss", async (req: AuthRequest, res: Response) => {
    await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({ where: { id: req.params.id }, select: auditSelect });
        if (!post) throw new HttpError(404, "Post not found.");

        await tx.post.update({ where: { id: post.id }, data: { isReported: false, numberOfReports: 0 } });
        // Clear the per-reader rows too, so the count and the rows agree.
        await tx.report.deleteMany({ where: { postId: post.id } });
        await logAction(tx, req.userId!, postEntry("dismiss_reports", post));
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
        await logAction(tx, req.userId!, postEntry("remove_post", post));
    });

    invalidateFeed();
    res.json({ success: true });
});
