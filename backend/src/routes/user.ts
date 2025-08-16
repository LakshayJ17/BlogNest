import express from "express";
import jwt from "jsonwebtoken"
import { signupInput, signinInput } from "@lakshayj17/common-app";
import bcrypt from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

export const userRouter = express.Router();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

userRouter.post("/signup", async (req: Request, res: Response) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const body = req.body;
    const { success } = signupInput.safeParse(body);

    if (!success) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const hashedPassword = await bcrypt.hash(body.password, salt);

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
        if (existingUser) {
            res.status(409);
            return res.json({ error: "Email already exits" })
        }

        const user = await prisma.user.create({
            data: {
                name: body.name || "Anonymous",
                email: body.email,
                hashedPassword: hashedPassword
            },
        });

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        return res.json({ jwt: token });
    } catch (error) {
        return res.status(400).json({ error: "Error creating user" });
    }
});

userRouter.post("/signin", async (req: Request, res: Response) => {
    // zod validation
    const body = req.body;
    const { success } = signinInput.safeParse(body);
    if (!success) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            },
        });

        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }

        if (!user.hashedPassword) {
            return res.status(400).json({ error: "User does not have a password set" });
        }

        const passwordMatches = await bcrypt.compare(body.password, user.hashedPassword);
        if (!passwordMatches) {
            return res.status(403).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        return res.json({ jwt: token });
    } catch (error) {
        console.log("Error in signin", error);
        return res.status(400).json({ error: "Error signing in" });
    }
});

userRouter.post("/google-auth", async (req: Request, res: Response) => {
    const body = req.body;
    const { email, name, googleId, avatar } = body;

    if (!email || !googleId) {
        return res.status(400).json({ error: "Email and Google ID are required" });
    }

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
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        return res.json({ jwt: token });
    } catch (error) {
        console.log("Error during google signup/signin", error);
        return res.status(500).json({ error: "Error in Google authentication" });
    }
});

userRouter.get("/me", async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = (payload as any).id;

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
            res.status(404);
            return res.json({ error: "User not found" });
        }

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            googleId: user.googleId,
            avatar: user.avatar,
            bio: user.bio,
            posts: user.posts,
            likes: user.likes,
        });
    } catch (error) {
        console.log("Error in /me endpoint:", error);
        res.status(401);
        return res.json({ error: "Invalid token" });
    }
});
