import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from '@lakshayj17/common-app'
import OpenAI from "openai";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
        OPENAI_API_KEY: string,
    },
    Variables: {
        userId: string
    }
}>();


async function requireAuth(c: any, next: any) {
    const jwt = c.req.header('Authorization');
    if (!jwt) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    const token = jwt.split(' ')[1];
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    c.set('userId', (payload as { id: string }).id);
    return next()
}

// Post blog
blogRouter.post('/', requireAuth, async (c) => {
    const userId = c.get('userId');

    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId,
            labels: body.labels,
        }
    });

    return c.json({
        id: post.id
    });
})

// Update blog content
blogRouter.put('/', requireAuth, async (c) => {
    const userId = c.get('userId');

    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    prisma.post.update({
        where: {
            id: body.id,
            authorId: userId,
        },
        data: {
            title: body.title,
            content: body.content
        }
    });

    return c.text('updated post');
})

// Get all blogs 
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            date: true,
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
    });

    return c.json({
        posts
    });
})

// Get particular blog by id 
blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id');

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                title: true,
                content: true,
                date: true,
                author: {
                    select: {
                        name: true,
                        googleId: true,
                        avatar: true,
                        bio: true
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
            c.status(404)
            return c.json({ error: "Post not found" })
        }
        return c.json({ post })
    } catch (e) {
        console.log(e)
        return c.json({ error: "Post not found" })
    }
})

// Like / unlike the post
blogRouter.post('/:id/like', requireAuth, async (c) => {
    const userId = c.get('userId')
    const postId = c.req.param('id')

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
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
            return c.json({ liked: false })
        } else {
            await prisma.like.create({
                data: {
                    userId: userId,
                    postId: postId
                }
            })
            return c.json({ liked: true })
        }
    } catch (e) {
        console.error("Error toggling like:", e);
        c.status(500);
        return c.json({ error: "Could not toggle like" });
    }
})

// Check if post is liked or not 
blogRouter.get('/:id/liked', requireAuth, async (c) => {
    const userId = c.get('userId');
    const postId = c.req.param('id');

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const liked = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return c.json({ liked: !!liked });
    } catch (e) {
        console.error("Error checking like:", e);
        c.status(500);
        return c.json({ error: "Could not check like status" });
    }
});

// Make ai post
blogRouter.post('/ai-post', requireAuth, async (c) => {
    const body = await c.req.json();
    const { title } = body;

    if (!title) {
        c.status(400);
        return c.json({ error: "Title not found" })
    }

    const client = new OpenAI({
        apiKey: c.env.OPENAI_API_KEY
    });

    const SYSTEM_PROMPT = `You are an expert blog writer.
Write a well-structured, engaging, and informative blog article on the topic: "${title}".
Return the article in valid HTML format, using headings (<h2>, <h3>), paragraphs (<p>), and lists (<ul>, <ol>) where appropriate.
Do not include any code blocks.
If the topic is illegal, violent, or clearly unsafe, do not generate the article and return an error message instead. Otherwise, always generate the article.`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: SYSTEM_PROMPT }]
        });

        return c.json({
            content: response.choices[0].message.content
        })
    } catch (error) {
        console.log("Error in generating content : ", error)
        c.status(400)
        return c.json({ error: "Error generating content" })
    }
})

// Get ai summary
blogRouter.post('/ai-summary', requireAuth, async (c) => {
    const body = await c.req.json();
    const { content } = body;

    if (!content) {
        c.status(400)
        return c.json({ error: "Content not found" })
    }

    const client = new OpenAI({
        apiKey: c.env.OPENAI_API_KEY
    });

    const SYSTEM_PROMPT = `You are an expert blog summarizer.
Summarize the following article content in 5-7 sentences, focusing only on the most important points, facts, and statistics. Be brief but clear.
Return the summary in plain text, without any code blocks.
If the topic is illegal, violent, or clearly unsafe, do not generate the summary and return an error message instead. Otherwise, always generate the summary.

Article content:
${content}
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: SYSTEM_PROMPT }]
        });

        return c.json({
            summary: response.choices[0].message.content
        })
    } catch (error) {
        console.log("Error in summarising content : ", error)
        c.status(400)
        return c.json({ error: "Error summarising content" })
    }
})



