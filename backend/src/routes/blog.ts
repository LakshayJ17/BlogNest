import { Router, Request, Response } from "express";
import { createHash } from "crypto";
import apicache from "apicache";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError, parseInput } from "../lib/errors";
import {
    aiPostSchema,
    aiSummarySchema,
    createPostSchema,
    listPostsQuerySchema,
    MAX_CONTENT_LENGTH,
    MAX_LIST_POSTS,
    updateDraftSchema,
    updatePublishedSchema,
} from "../lib/validation";
import { readingMinutes, sanitizePostHtml, tidyPunctuation, toPlainText, withPreview } from "../lib/html";
import { AIError, aiEnabled, generateArticle, isContentFlagged, streamSummary } from "../lib/ai";
import { AuthRequest, optionalAuth, requireAuth } from "../middleware";
import { aiLimiter, readLimiter, reportLimiter, summaryLimiter, writeLimiters } from "../rate-limiters";

export const blogRouter = Router();

// Cache only the response body. Per-request headers must stay live: CORS
// (the site is served from two origins), Vary, and rate-limit counters.
// Otherwise the first visitor's origin is replayed to everyone for a minute.
apicache.options({
    headerBlacklist: [
        "access-control-allow-origin",
        "access-control-allow-credentials",
        "vary",
        "ratelimit",
        "ratelimit-policy",
    ],
});

const cacheOkResponses = [
    // apicache lets any client skip the cache with these headers; don't.
    (req: Request, _res: Response, next: () => void) => {
        delete req.headers["x-apicache-bypass"];
        delete req.headers["x-apicache-force-fetch"];
        next();
    },
    apicache.middleware("1 minute", (_req: Request, res: Response) => res.statusCode === 200),
];

/** Drop cached feed pages so new, edited, or removed posts show up right away. */
export function invalidateFeed() {
    apicache.clear(undefined);
}

const publicAuthor = { select: { name: true, avatar: true, bio: true } } as const;

const listSelect = {
    id: true,
    title: true,
    content: true,
    date: true,
    status: true,
    labels: true,
    authorId: true,
    author: publicAuthor,
    _count: { select: { likes: true } },
} satisfies Prisma.PostSelect;

type Status = "draft" | "published";

/** Sanitize post HTML, check it isn't empty, and moderate it if it's going public. */
async function prepareContent(title: string, rawContent: string, status: Status): Promise<string> {
    const content = sanitizePostHtml(rawContent);
    // Check again after cleaning, which can make text longer ("&" -> "&amp;").
    if (content.length > MAX_CONTENT_LENGTH) {
        throw new HttpError(413, "Your post is too long. Try splitting it into two.");
    }
    const text = toPlainText(content);

    if (!text && !/<img\s/i.test(content)) {
        throw new HttpError(400, "Write something before saving.");
    }

    if (status === "published" && (await isContentFlagged(title, text))) {
        throw new HttpError(
            422,
            "This post seems to break our content guidelines, so it wasn't published. Please edit it and try again."
        );
    }
    return content;
}

async function createPost(req: AuthRequest, res: Response, status: Status) {
    const { title, content, labels } = parseInput(createPostSchema, req.body);
    const cleanContent = await prepareContent(title, content, status);

    const post = await prisma.post.create({
        data: {
            title,
            content: cleanContent,
            labels,
            status,
            authorId: req.userId!,
            isAIGenerated: labels.includes("AI Generated"),
        },
        select: { id: true },
    });

    if (status === "published") invalidateFeed();
    res.status(201).json({ id: post.id, status });
}

// Create a draft
blogRouter.post("/draft", requireAuth("user"), writeLimiters, (req: AuthRequest, res: Response) =>
    createPost(req, res, "draft")
);

// Create and publish a post
blogRouter.post("/publish", requireAuth("user"), writeLimiters, (req: AuthRequest, res: Response) =>
    createPost(req, res, "published")
);

// Edit a published post
blogRouter.put("/publish", requireAuth("user"), writeLimiters, async (req: AuthRequest, res: Response) => {
    const { id, title, content, labels } = parseInput(updatePublishedSchema, req.body);

    const existing = await prisma.post.findFirst({
        where: { id, authorId: req.userId, status: "published" },
        select: { id: true },
    });
    if (!existing) throw new HttpError(404, "Post not found.");

    const cleanContent = await prepareContent(title, content, "published");
    await prisma.post.update({
        where: { id },
        data: {
            title,
            content: cleanContent,
            ...(labels ? { labels, isAIGenerated: labels.includes("AI Generated") } : {}),
        },
    });

    invalidateFeed();
    res.json({ id, status: "published" });
});

// Public feed: paginated, searchable, filterable
blogRouter.get("/bulk", readLimiter, cacheOkResponses, async (req: Request, res: Response) => {
    const { q, label, sort, page, limit } = parseInput(listPostsQuerySchema, req.query);

    const where: Prisma.PostWhereInput = { status: "published" };
    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
        ];
    }
    if (label) where.labels = { has: label };

    const orderBy: Prisma.PostOrderByWithRelationInput[] =
        sort === "popular" ? [{ likes: { _count: "desc" } }, { date: "desc" }] : [{ date: "desc" }];

    const rows = await prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit + 1,
        select: listSelect,
    });

    res.json({
        posts: rows.slice(0, limit).map(withPreview),
        page,
        hasMore: rows.length > limit,
    });
});

blogRouter.get("/drafts", requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const drafts = await prisma.post.findMany({
        where: { status: "draft", authorId: req.userId },
        orderBy: { date: "desc" },
        take: MAX_LIST_POSTS,
        select: listSelect,
    });
    res.json({ drafts: drafts.map(withPreview) });
});

// Update a draft, optionally publishing it
blogRouter.patch("/:id", requireAuth("user"), writeLimiters, async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const { title, content, labels, status } = parseInput(updateDraftSchema, req.body);

    const draft = await prisma.post.findFirst({
        where: { id, authorId: req.userId, status: "draft" },
        select: { id: true },
    });
    if (!draft) throw new HttpError(404, "Draft not found.");

    const cleanContent = await prepareContent(title, content, status);
    await prisma.post.update({
        where: { id },
        data: {
            title,
            content: cleanContent,
            labels,
            status,
            isAIGenerated: labels.includes("AI Generated"),
            // A post's date is when it went public, not when the draft was started.
            ...(status === "published" ? { date: new Date() } : {}),
        },
    });

    if (status === "published") invalidateFeed();
    res.json({ id, status });
});

// AI: write an article from a title
blogRouter.post("/ai-post", requireAuth("user"), aiLimiter, async (req: AuthRequest, res: Response) => {
    const { title } = parseInput(aiPostSchema, req.body);
    const html = await generateArticle(title);
    res.json({ content: sanitizePostHtml(tidyPunctuation(html)) });
});

// AI: streamed summary of a published post (by id, so this can't be used as an open AI proxy)
const SUMMARY_INPUT_LIMIT = 12_000;
const SUMMARY_CACHE_SIZE = 200;
const SUMMARY_CACHE_TTL = 24 * 60 * 60 * 1000;
const summaryCache = new Map<string, { text: string; at: number }>();

function rememberSummary(key: string, text: string) {
    summaryCache.delete(key);
    summaryCache.set(key, { text, at: Date.now() });
    if (summaryCache.size > SUMMARY_CACHE_SIZE) {
        const oldest = summaryCache.keys().next().value;
        if (oldest) summaryCache.delete(oldest);
    }
}

blogRouter.post("/ai-summary", optionalAuth, summaryLimiter, async (req: AuthRequest, res: Response) => {
    const { postId } = parseInput(aiSummarySchema, req.body);

    const post = await prisma.post.findFirst({
        where: { id: postId, status: "published" },
        select: { id: true, content: true },
    });
    if (!post) throw new HttpError(404, "Post not found.");

    const text = toPlainText(post.content);
    if (text.length < 300) {
        throw new HttpError(400, "This post is short enough to read in under a minute.");
    }

    const cacheKey = `${post.id}:${createHash("sha1").update(post.content).digest("hex")}`;
    const cached = summaryCache.get(cacheKey);
    const fresh = cached && Date.now() - cached.at < SUMMARY_CACHE_TTL ? cached.text : null;

    if (!fresh && !aiEnabled) {
        throw new AIError(503, "AI summaries aren't set up on this server yet.");
    }

    // If the reader leaves early we keep generating (bounded by max_tokens) so
    // the summary is cached. Aborting would let someone disconnect after the
    // first words and have every request billed again.
    let readerLeft = false;
    res.on("close", () => {
        readerLeft = true;
    });

    // Pull the first chunk before sending headers, so setup errors (rate limit,
    // provider down) still return a normal JSON error with the right status.
    const stream = fresh ? null : streamSummary(text.slice(0, SUMMARY_INPUT_LIMIT), new AbortController().signal);
    const first = stream ? await stream.next() : null;

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    const send = (data: unknown) => {
        if (!readerLeft) res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (fresh) {
        send({ content: fresh });
    } else if (stream && first) {
        let full = "";
        try {
            if (!first.done) {
                full += first.value;
                send({ content: first.value });
            }
            for await (const chunk of stream) {
                full += chunk;
                send({ content: chunk });
            }
            if (full.trim()) rememberSummary(cacheKey, tidyPunctuation(full.trim()));
        } catch (error) {
            console.error("[ai] summary stream failed:", error);
            send({ error: "The summary was interrupted. Please try again." });
        }
    }

    if (!readerLeft) {
        res.write("data: [DONE]\n\n");
        res.end();
    }
});

blogRouter.post("/report/:id", requireAuth("user"), reportLimiter, async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const post = await prisma.post.findFirst({
        where: { id, status: "published" },
        select: { authorId: true },
    });
    if (!post) throw new HttpError(404, "Post not found.");
    if (post.authorId === req.userId) throw new HttpError(400, "You can't report your own post.");

    await prisma.post.update({
        where: { id },
        data: { isReported: true, numberOfReports: { increment: 1 } },
    });

    res.json({ reported: true });
});

// Single post. Drafts are visible only to their author.
blogRouter.get("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
    const visibility: Prisma.PostWhereInput[] = [{ status: "published" }];
    if (req.userId) visibility.push({ status: "draft", authorId: req.userId });

    const post = await prisma.post.findFirst({
        where: { id: req.params.id, OR: visibility },
        select: { ...listSelect, isAIGenerated: true },
    });
    if (!post) throw new HttpError(404, "This post doesn't exist or has been removed.");

    // Older posts were saved before server-side sanitizing existed.
    const content = sanitizePostHtml(post.content);
    res.json({
        post: { ...post, content, readingMinutes: readingMinutes(toPlainText(content)) },
    });
});

blogRouter.delete("/:id", requireAuth("user"), writeLimiters, async (req: AuthRequest, res: Response) => {
    const post = await prisma.post.findFirst({
        where: { id: req.params.id, authorId: req.userId, status: { in: ["draft", "published"] } },
        select: { id: true, status: true },
    });
    if (!post) throw new HttpError(404, "Post not found.");

    await prisma.post.update({ where: { id: post.id }, data: { status: "deleted" } });

    // Drafts never appear in the feed, so only clear the cache for public posts.
    if (post.status === "published") invalidateFeed();
    res.json({ success: true });
});

// Like or unlike a post
blogRouter.post("/:id/like", requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const postId = req.params.id;

    const post = await prisma.post.findFirst({
        where: { id: postId, status: "published" },
        select: { id: true },
    });
    if (!post) throw new HttpError(404, "Post not found.");

    const removed = await prisma.like.deleteMany({ where: { userId, postId } });
    let liked = false;
    if (removed.count === 0) {
        try {
            await prisma.like.create({ data: { userId, postId } });
        } catch (error) {
            // A double click can race; the like exists either way.
            if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
                throw error;
            }
        }
        liked = true;
    }

    const likes = await prisma.like.count({ where: { postId } });
    res.json({ liked, likes });
});

blogRouter.get("/:id/liked", requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const like = await prisma.like.findUnique({
        where: { userId_postId: { userId: req.userId!, postId: req.params.id } },
        select: { id: true },
    });
    res.json({ liked: Boolean(like) });
});
