import express from "express";
import { PrismaClient } from '@prisma/client'
import { createBlogInput, updateBlogInput } from '@lakshayj17/common-app'
import OpenAI from "openai";
import { Request, Response, NextFunction } from "express";
// import jwt from 'jsonwebtoken'
import { AuthRequest, requireAuth } from "../middleware";

export const blogRouter = express.Router();

const prisma = new PrismaClient();

// const JWT_SECRET = process.env.JWT_SECRET as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

// interface AuthRequest extends Request {
//     userId?: string;
// }

// async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//         const payload = jwt.verify(token, JWT_SECRET) as { id: string };
//         req.userId = payload.id;
//         return next()
//     } catch (err) {
//         return res.status(401).json({ error: "Invalid or expired token" });
//     }
// }

// Draft post
blogRouter.post('/draft', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        res.status(400);
        return res.json({ error: "Invalid input" });
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
        const input = [body.title, body.content]
        const moderation = await client.moderations.create({
            model: "omni-moderation-latest",
            input: input
        });

        if (moderation.results.some(result => result.flagged)) {
            return res.status(400).json({ error: "Your post contains harmful or unsafe content" })
        }

        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId,
                labels: body.labels,
                status: "draft"
            }
        });

        return res.json({
            id: post.id
        });
    } catch (error) {
        // console.log(error)
        res.status(400).json({ error: "Error creating post" })
    }
})

// Post blog
blogRouter.post('/publish', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        res.status(400);
        return res.json({ error: "Invalid input" });
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
        const input = [body.title, body.content]
        const moderation = await client.moderations.create({
            model: "omni-moderation-latest",
            input: input
        });

        if (moderation.results.some(result => result.flagged)) {
            return res.status(400).json({ error: "Your post contains harmful or unsafe content" })
        }

        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId,
                labels: body.labels,
                status: "published"
            }
        });

        return res.json({
            id: post.id
        });
    } catch (error) {
        res.status(400).json({ error: "Error creating post" })
    }
})

// Update blog content
blogRouter.put('/publish', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    const body = req.body;
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        res.status(400);
        return res.json({ error: "Invalid input" });
    }

    try {
        await prisma.post.update({
            where: {
                id: body.id,
                authorId: userId,
            },
            data: {
                title: body.title,
                content: body.content
            }
        });

        return res.send('updated post');
    } catch (error) {
        return res.status(400).json({ error: "Error updating post" })
    }

})

// Get all blogs 
blogRouter.get('/bulk', async (req: Request, res: Response) => {
    const q = req.query.q as string || ""
    const label = req.query.label as string;

    const where: any = {
        status: "published"
    };

    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } }
        ]
    }
    if (label) {
        where.labels = { has: label }
    }

    try {
        const posts = await prisma.post.findMany({
            where,
            select: {
                id: true,
                title: true,
                content: true,
                date: true,
                authorId: true,
                author: {
                    select: {
                        name: true,
                        googleId: true,
                        avatar: true,
                        bio: true,
                        role: true
                    }
                },
                labels: true,
                _count: {
                    select: {
                        likes: true,
                    },
                },
                status: true,
                isReported: true,
                numberOfReports: true
            }
        });

        return res.json({
            posts
        });
    } catch (error) {
        return res.status(400).json({ error: "Error fetching posts" });
    }

})

blogRouter.get('/drafts', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    try {
        const drafts = await prisma.post.findMany({
            where: {
                status: "draft",
                authorId: userId
            },
            select: {
                id: true,
                title: true,
                content: true,
                date: true,
                status: true,
                author: {
                    select: {
                        name: true,
                        googleId: true,
                        avatar: true,
                        bio: true,
                    }
                },
                labels: true,
                _count: {
                    select: {
                        likes: true,
                    },
                },
            }
        })
        return res.json({ drafts })
    } catch (error) {
        return res.status(400).json({ error: "No drafts found" })
    }
})

blogRouter.patch('/:id', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const { title, content, labels, status } = req.body;
    const userId = req.userId;

    try {
        const updated = await prisma.post.updateMany({
            where: {
                id,
                authorId: userId,
                status: "draft"
            }, data: {
                title,
                content,
                labels,
                status
            }
        })

        if (updated.count === 0) {
            return res.status(404).json({ error: "Draft not found" })
        }
        return res.json({ success: true })
    } catch (error) {
        return res.status(400).json({ error: "Could not update draft" })
    }
})

// Get particular blog by id 
blogRouter.get('/:id', async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const userId = req.userId;

    try {
        const post = await prisma.post.findFirst({
            where: {
                id,
                OR: [
                    { status: "published" },
                    { status: "draft", authorId: userId }
                ]
            },
            select: {
                id: true,
                title: true,
                content: true,
                date: true,
                authorId: true,
                author: {
                    select: {
                        name: true,
                        googleId: true,
                        avatar: true,
                        bio: true,
                        role: true
                    }
                },
                labels: true,
                _count: {
                    select: {
                        likes: true,
                    },
                },
            }
        })
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        return res.json({ post })
    } catch (e) {
        return res.status(400).json({ error: "Post not found" })
    }
})

blogRouter.delete('/:id', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const userId = req.userId;

    try {
        const blog = await prisma.post.findUnique({
            where: { id, authorId: userId }
        })

        if (!blog) {
            return res.status(400).json({ error: "Post not found" })
        }

        await prisma.post.update({
            where: { id },
            data: { status: "deleted" }
        })

        return res.json({ success: true })
    } catch (error) {
        return res.status(400).json({ error: 'Error in deleting post' })
    }
})

// Like / unlike the post
blogRouter.post('/:id/like', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    const postId = req.params.id

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: postId
                }
            }
        })

        if (existing) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId: userId,
                        postId: postId
                    }
                }
            })
            return res.json({ liked: false })
        } else {
            await prisma.like.create({
                data: {
                    userId: userId,
                    postId: postId
                }
            })
            return res.json({ liked: true })
        }
    } catch (e) {
        return res.status(500).json({ error: "Could not toggle like" });
    }
})

// Check if post is liked or not 
blogRouter.get('/:id/liked', requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const postId = req.params.id;

    try {
        const liked = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return res.json({ liked: !!liked });
    } catch (e) {
        // console.error("Error checking like:", e);
        return res.status(500).json({ error: "Could not check like status" });
    }
});

// Make ai post
blogRouter.post('/ai-post', requireAuth("user"), async (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title not found" })
    }

    const client = new OpenAI({
        apiKey: OPENAI_API_KEY
    });

    const SYSTEM_PROMPT = `You are an expert blog writer.
Write a well-structured, engaging, and informative blog article on the topic: "${title}".
Return the article in valid HTML format, using headings (<h2>, <h3>), paragraphs (<p>), and lists (<ul>, <ol>) where appropriate.
If the topic involves code or programming, include code blocks using <pre><code>...</code></pre> tags.
If the topic is illegal, violent, or clearly unsafe, do not generate the article and return an error message instead. Otherwise, always generate the article.`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: SYSTEM_PROMPT }],
            max_completion_tokens: 2000
        });

        return res.json({
            content: response.choices[0].message.content
        })
    } catch (error) {
        // console.log("Error in generating content : ", error)
        return res.status(400).json({ error: "Error generating content" })
    }
})


blogRouter.post('/ai-summary', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: "Content not found" })
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const SUMMARY_PROMPT = `You are an expert blog summarizer.
Summarize the following article content in 5-7 sentences, focusing only on the most important points.
Return the summary in plain text.

Article content:
${content}
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [{ role: "system", content: SUMMARY_PROMPT }]
        });

        for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
                res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
            }
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (error) {
        // console.error("Error in summarising content:", error);
        res.status(500).json({ error: "Error summarising content" });
    }
});

blogRouter.post("/report/:id", requireAuth("user"), async (req: AuthRequest, res: Response) => {
    const postId = req.params.id

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        await prisma.post.update({
            where: {
                id: postId
            },
            data: {
                isReported : true,
                numberOfReports: post.numberOfReports + 1
            }
        })

        return res.status(200).json({ reported: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error reporting post" })
    }
})
