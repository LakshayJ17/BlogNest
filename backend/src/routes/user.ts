import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from '@lakshayj17/common-app'

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

userRouter.post('/signup', async (c) => {
    // c -> context
    // zod validation

    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);

    if (!success) {
        c.status(400)
        return c.json({ error: "Invalid input" })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name,
            }
        })

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({ jwt, name: user.name });


    } catch (error) {
        c.status(411)
        return c.json({ error: "Error creating user" })
    }
})

userRouter.post('/signin', async (c) => {
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
            }
        })

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found" });
        }
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({
            jwt,
            name: user.name || "Anonymous"
        });
    } catch(error){
        console.log("Error in signin", error)
        c.status(400)
        return c.json({error : "Error signing in"})
    }

    
})

userRouter.post('/google-auth', async (c) => {
    const body = await c.req.json();
    const { email, name, googleId, avatar } = body;

    if (!email || !googleId) {
        c.status(400);
        return c.json({ error: "Email and Google ID are required" })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        let user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: name || "Google User",
                    googleId: googleId,
                    avatar: avatar
                }
            })
        }
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({
            jwt,
            name: user.name || "Anonymous"
        });
    } catch (error) {
        console.log("Error during google signup/signin", error);
        c.status(500)
        return c.json({ error: "Error in Google authentication" })
    } finally {
        await prisma.$disconnect()
    }
})
