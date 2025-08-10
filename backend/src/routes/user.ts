import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@lakshayj17/common-app";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
}>();

userRouter.post("/signup", async (c) => {
    // c -> context
    // zod validation

    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);

    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name || "Anonymous",
            },
        });

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (error) {
        c.status(411);
        return c.json({ error: "Error creating user" });
    }
});

userRouter.post("/signin", async (c) => {
    // zod validation
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password,
            },
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found" });
        }
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (error) {
        console.log("Error in signin", error);
        c.status(400);
        return c.json({ error: "Error signing in" });
    }
});

userRouter.post("/google-auth", async (c) => {
    const body = await c.req.json();
    const { email, name, googleId, avatar } = body;

    if (!email || !googleId) {
        c.status(400);
        return c.json({ error: "Email and Google ID are required" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        let user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: name || "Google User",
                    googleId: googleId,
                    avatar: avatar,
                },
            });
        }
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (error) {
        console.log("Error during google signup/signin", error);
        c.status(500);
        return c.json({ error: "Error in Google authentication" });
    } finally {
        await prisma.$disconnect();
    }
});

userRouter.get("/me", async (c) => {
    // Get the authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        c.status(401);
        return c.json({ error: "Authorization header required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = await verify(token, c.env.JWT_SECRET);
        const userId = (payload as any).id;

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        published: true,
                        date: true,
                    },
                },
                likes: {
                    select: {
                        id: true,
                        postId: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            c.status(404);
            return c.json({ error: "User not found" });
        }

        return c.json({
            id: user.id,
            name: user.name,
            email: user.email,
            googleId: user.googleId,
            avatar: user.avatar,
            posts: user.posts,
            likes: user.likes,
        });
    } catch (error) {
        console.log("Error in /me endpoint:", error);
        c.status(401);
        return c.json({ error: "Invalid token" });
    }
});
